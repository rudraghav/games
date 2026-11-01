'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Link2 } from 'lucide-react';
import { Avatar, Button, Modal, ChoiceGroup } from '@games/ui';
import { games, gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import { keys } from './query-keys';
import { rememberedPlayer, rememberPlayer } from './player-preferences';
import { refreshPlayer } from './player-query';

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'join' | 'configure';
  gameId?: string;
  invite?: string;
  roomId?: string;
  withBots?: boolean;
}
export function RoomDialog({
  open,
  onOpenChange,
  mode = 'create',
  gameId = 'uno',
  invite = '',
  roomId,
  withBots = false,
}: RoomDialogProps) {
  const router = useRouter();
  const cache = useQueryClient();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: open });
  const [selectedGame, setSelectedGame] = useState(gameId);
  const [playWith, setPlayWith] = useState<'friends' | 'bots'>(withBots ? 'bots' : 'friends');
  const [name, setName] = useState<string>();
  const [avatar, setAvatar] = useState<number>();
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState(invite);
  const [capacity, setCapacity] = useState(
    withBots ? gameById(gameId).minPlayers : Math.min(4, gameById(gameId).maxPlayers),
  );
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const game = gameById(selectedGame);
  const displayName =
    name ?? me.data?.profile?.name ?? (open ? rememberedPlayer()?.name : '') ?? '';
  const chosenAvatar = avatar ?? me.data?.profile?.avatar ?? 0;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      let room =
        mode === 'join'
          ? await api.join(code.trim(), displayName.trim(), chosenAvatar)
          : mode === 'configure' && roomId
            ? await api.configure(roomId, game.id, capacity, settings)
            : await api.create({
                name: displayName.trim(),
                avatar: chosenAvatar,
                gameId: game.id,
                roomName: roomName.trim() || `${displayName.trim()}'s game night`,
                capacity,
                settings,
                bots: playWith === 'bots' && game.botsSupported ? capacity - 1 : 0,
              });
      if (
        mode === 'create' &&
        (game.family === 'tarot' || (playWith === 'bots' && game.botsSupported))
      ) {
        // Creation is already committed; failed auto-start recovers in this room.
        try {
          await api.ready(room.id, true);
          room = await api.start(room.id);
        } catch {
          room = await api.room(room.id).catch(() => room);
        }
      }
      rememberPlayer(displayName.trim(), chosenAvatar);
      cache.setQueryData(keys.room(room.id), room);
      // Room entry already committed. A failed identity read must lead to the
      // room's read-only retry state, never back to a repeatable create/join.
      await refreshPlayer(cache, () => api.me()).catch(() => undefined);
      onOpenChange(false);
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'join' ? 'Join room' : mode === 'configure' ? 'Room settings' : 'Create room'}
      description={
        mode === 'join'
          ? 'Enter your name and room code.'
          : mode === 'configure'
            ? 'Choose a game and seat count.'
            : 'Choose a game, players and settings.'
      }
    >
      <form className="room-setup-form" onSubmit={submit}>
        {mode !== 'configure' ? (
          <>
            <label className="field">
              Your name
              <input
                className="input"
                value={displayName}
                onChange={(event) => setName(event.target.value)}
                placeholder="What should we call you?"
                required
                maxLength={30}
                autoComplete="nickname"
              />
            </label>
            {mode === 'create' && game.botsSupported ? (
              <ChoiceGroup
                label="Play with"
                options={[
                  { value: 'friends', label: 'Friends' },
                  { value: 'bots', label: 'Bots' },
                ]}
                value={playWith}
                onChange={(value) => {
                  setPlayWith(value);
                  if (value === 'bots') setCapacity(game.minPlayers);
                }}
              />
            ) : null}
            <div className="avatar-options" role="group" aria-label="Choose your avatar colour">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="avatar-option"
                  aria-label={`Avatar colour ${i + 1}`}
                  aria-pressed={chosenAvatar === i}
                  onClick={() => setAvatar(i)}
                >
                  <Avatar name={displayName || 'You'} seed={i} size="sm" />
                </button>
              ))}
            </div>
          </>
        ) : null}
        {mode === 'join' ? (
          <label className="field">
            <span>
              <Link2 size={14} className="inline-icon" /> Room code
            </span>
            <input
              className="input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter your 8-character code"
              required
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        ) : (
          <>
            <label className="field">
              The game
              <select
                className="input"
                value={game.id}
                onChange={(event) => {
                  const next = gameById(event.target.value);
                  setSelectedGame(next.id);
                  setCapacity(Math.max(next.minPlayers, Math.min(capacity, next.maxPlayers)));
                  setSettings({});
                }}
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label className="field">
                Seats
                <select
                  className="input"
                  value={capacity}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                >
                  {Array.from(
                    { length: game.maxPlayers - game.minPlayers + 1 },
                    (_, i) => game.minPlayers + i,
                  ).map((count) => (
                    <option value={count} key={count}>
                      {count} players
                    </option>
                  ))}
                </select>
              </label>
              {mode === 'create' ? (
                <label className="field">
                  Room name
                  <input
                    className="input"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                    placeholder="Friday game night"
                    maxLength={60}
                  />
                </label>
              ) : null}
            </div>
            {game.settings.map((setting) => (
              <label className="toggle-row" key={setting.key}>
                <input
                  type="checkbox"
                  checked={settings[setting.key] ?? setting.default}
                  onChange={(event) =>
                    setSettings({ ...settings, [setting.key]: event.target.checked })
                  }
                />
                {setting.label}
              </label>
            ))}
          </>
        )}
        {error ? (
          <p className="error-note" role="alert">
            {error}
          </p>
        ) : null}
        <div className="form-footer">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" pending={pending}>
            {mode === 'join'
              ? 'Join the room'
              : mode === 'configure'
                ? 'Choose game'
                : playWith === 'bots'
                  ? 'Play game'
                  : 'Create room'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
