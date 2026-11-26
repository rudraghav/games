'use client';
import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ChevronDown, Minus, Plus } from 'lucide-react';
import { Avatar, Button, Modal, ChoiceGroup } from '@games/ui';
import { games, gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import { keys } from './query-keys';
import { rememberedPlayer, rememberPlayer } from './player-preferences';
import { refreshPlayer } from './player-query';
import { formatInviteInput, roomInvite } from './room-invite';
import { roomPath } from './game-paths';
import { botNameProblem, emptyBotRows, type BotRow } from './bot-seats';
import { createRoomInput, setupBotCount, startsImmediately } from './room-setup';
import { BotPlayersFields } from './BotPlayersFields';
import { RoomCodeField } from './RoomCodeField';
import { ADULTS_ONLY, adultsGate, rememberAdultsOnly } from './adults-only';

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'join' | 'configure';
  gameId?: string;
  invite?: string;
  roomId?: string;
  withBots?: boolean;
  fixedGame?: boolean;
  friendsOnly?: boolean;
}
export function RoomDialog({
  open,
  onOpenChange,
  mode = 'create',
  gameId = 'uno',
  invite = '',
  roomId,
  withBots = false,
  fixedGame = false,
  friendsOnly = false,
}: RoomDialogProps) {
  const avatarPicker = useRef<HTMLDetailsElement>(null);
  const avatarOpener = useRef<HTMLElement>(null);
  const router = useRouter();
  const cache = useQueryClient();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: open });
  const [selectedGame, setSelectedGame] = useState(gameId);
  const [playWith, setPlayWith] = useState<'friends' | 'bots'>(
    withBots && !friendsOnly ? 'bots' : 'friends',
  );
  const [name, setName] = useState<string>();
  const [avatar, setAvatar] = useState<number>();
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState(() => formatInviteInput(invite));
  // Bots seated beside friends. Bots mode ignores this and fills every other seat.
  const [friendBots, setFriendBots] = useState(0);
  const [botRows, setBotRows] = useState<BotRow[]>(emptyBotRows);
  const [capacity, setCapacity] = useState(
    withBots && !friendsOnly
      ? gameById(gameId).minPlayers
      : Math.min(4, gameById(gameId).maxPlayers),
  );
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  // The 18+ edition needs the host to confirm everyone in the room is an adult.
  const [adultsConfirmed, setAdultsConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const game = gameById(selectedGame);
  const displayName =
    name ?? me.data?.profile?.name ?? (open ? rememberedPlayer()?.name : '') ?? '';
  const chosenAvatar = avatar ?? me.data?.profile?.avatar ?? rememberedPlayer()?.avatar ?? 0;
  const choice = { game, playWith, capacity, friendBots, friendsOnly };
  const botCount = mode === 'create' ? setupBotCount(choice) : 0;
  const bots = botRows.slice(0, botCount);
  const botProblem = botCount ? botNameProblem(bots, displayName) : null;
  const autoStart = mode === 'create' && startsImmediately(choice);
  const { wanted: wantsAdults, blocked: adultsBlocked } = adultsGate(
    mode,
    game.settings,
    settings,
    adultsConfirmed,
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    // The clash is already explained beside the bot names.
    if (botProblem || adultsBlocked) return;
    setPending(true);
    setError('');
    try {
      let room =
        mode === 'join'
          ? await api.join(roomInvite(code), displayName.trim(), chosenAvatar)
          : mode === 'configure' && roomId
            ? await api.configure(roomId, game.id, capacity, settings)
            : await api.create(
                createRoomInput({
                  ...choice,
                  name: displayName,
                  avatar: chosenAvatar,
                  roomName,
                  settings,
                  botRows,
                }),
              );
      // A room with a seat left for a friend opens its lobby instead.
      if (autoStart) {
        // Creation is already committed; failed auto-start recovers in this room.
        try {
          await api.ready(room.id, true);
          room = await api.start(room.id);
        } catch {
          room = await api.room(room.id).catch(() => room);
        }
      }
      // The host already confirmed the 18+ edition here; the room won't ask them again.
      if (wantsAdults) rememberAdultsOnly(room.id);
      rememberPlayer(displayName.trim(), chosenAvatar);
      cache.setQueryData(keys.room(room.id), room);
      // Room entry already committed. A failed identity read must lead to the
      // room's read-only retry state, never back to a repeatable create/join.
      await refreshPlayer(cache, () => api.me()).catch(() => undefined);
      onOpenChange(false);
      router.push(roomPath(room));
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
      onEscapeKeyDown={(event) => {
        if (avatarPicker.current?.open) {
          event.preventDefault();
          avatarPicker.current.open = false;
          avatarOpener.current?.focus();
        }
      }}
      title={
        mode === 'join'
          ? 'Join room'
          : mode === 'configure'
            ? 'Room settings'
            : fixedGame
              ? `Play ${game.name} with friends`
              : 'Create room'
      }
      description={
        mode === 'join'
          ? 'Enter a room code or paste an invite link.'
          : mode === 'configure'
            ? game.maxPlayers === 1
              ? 'Choose a game for this room.'
              : 'Choose a game and seat count.'
            : game.maxPlayers === 1
              ? 'A private space for your own reading.'
              : 'Invite-only. Share a link or room code to add friends.'
      }
    >
      <form className="room-setup-form room-setup-form--simple" onSubmit={submit}>
        {mode === 'join' ? (
          <RoomCodeField value={code} onChange={setCode} />
        ) : (
          <>
            {!fixedGame ? (
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
                    setAdultsConfirmed(false);
                  }}
                >
                  {games.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {game.maxPlayers > 1 ? (
              <div className="room-play-options">
                {mode === 'create' && game.botsSupported && !friendsOnly ? (
                  <div className="room-play-mode">
                    <span className="field-label">Play with</span>
                    <ChoiceGroup
                      label="Play with"
                      variant="segmented"
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
                  </div>
                ) : null}
                <label className="field room-seat-field">
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
                        {playWith === 'bots' && game.botsSupported && mode === 'create'
                          ? `You + ${count - 1} ${count === 2 ? 'bot' : 'bots'}`
                          : `${count} ${count === 1 ? 'player' : 'players'}`}
                      </option>
                    ))}
                  </select>
                </label>
                {mode === 'create' &&
                game.botsSupported &&
                (friendsOnly || playWith === 'friends') ? (
                  <div className="bot-stepper" role="group" aria-label="Bots">
                    <div>
                      <span className="field-label">Bots</span>
                      <span className="small muted">Fill some seats with computer players.</span>
                    </div>
                    <div className="bot-stepper-controls">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Fewer bots"
                        disabled={botCount <= 0}
                        onClick={() => setFriendBots(botCount - 1)}
                      >
                        <Minus size={18} aria-hidden="true" />
                      </button>
                      <output aria-live="polite" aria-label={`${botCount} bots`}>
                        {botCount}
                      </output>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="More bots"
                        disabled={botCount >= capacity - 1}
                        onClick={() => setFriendBots(botCount + 1)}
                      >
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
        {mode !== 'configure' ? (
          <div className="room-player-fields">
            <label className="field">
              Your name
              <input
                className="input"
                value={displayName}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                maxLength={30}
                autoComplete="nickname"
              />
            </label>
            <details className="room-avatar-picker" ref={avatarPicker}>
              <summary ref={avatarOpener} aria-label="Change avatar" title="Change avatar">
                <Avatar name={displayName || 'You'} seed={chosenAvatar} size="sm" />
              </summary>
              <div className="avatar-options" role="group" aria-label="Choose your avatar colour">
                {Array.from({ length: 8 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="avatar-option"
                    aria-label={`Avatar colour ${i + 1}`}
                    aria-pressed={chosenAvatar === i}
                    onClick={() => {
                      setAvatar(i);
                      if (avatarPicker.current) avatarPicker.current.open = false;
                      avatarOpener.current?.focus();
                    }}
                  >
                    <Avatar name={displayName || 'You'} seed={i} size="sm" />
                  </button>
                ))}
              </div>
            </details>
          </div>
        ) : null}
        {botCount ? (
          <BotPlayersFields
            rows={bots}
            hostName={displayName}
            problem={botProblem}
            onChange={(index, change) =>
              setBotRows((rows) =>
                rows.map((row, at) => (at === index ? { ...row, ...change } : row)),
              )
            }
          />
        ) : null}
        {mode !== 'join' && (mode === 'create' || game.settings.length > 0) ? (
          <details className="room-extra-options">
            <summary>
              {mode === 'create' ? 'Room options' : 'Game rules'}
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <div className="room-extra-fields">
              {mode === 'create' ? (
                <label className="field">
                  Room name
                  <input
                    className="input"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                    placeholder={game.family === 'tarot' ? 'My reading' : 'Friday game night'}
                    maxLength={60}
                  />
                </label>
              ) : null}
              {game.settings.map((setting) => (
                <div className="room-setting" key={setting.key}>
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={settings[setting.key] ?? setting.default}
                      onChange={(event) => {
                        setSettings({ ...settings, [setting.key]: event.target.checked });
                        if (setting.key === ADULTS_ONLY) setAdultsConfirmed(false);
                      }}
                    />
                    {setting.label}
                  </label>
                  {setting.key === ADULTS_ONLY && wantsAdults ? (
                    <label className="toggle-row adults-confirm">
                      <input
                        type="checkbox"
                        required
                        checked={adultsConfirmed}
                        onChange={(event) => setAdultsConfirmed(event.target.checked)}
                      />
                      Everyone in this room is 18 or older
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
          </details>
        ) : null}
        {adultsBlocked ? (
          <p className="small muted" role="status">
            Confirm everyone in this room is 18 or older to use the 18+ edition.
          </p>
        ) : null}
        {error ? (
          <p className="error-note" role="alert">
            {error}
          </p>
        ) : null}
        <div className="form-footer">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" pending={pending} disabled={adultsBlocked}>
            {mode === 'join'
              ? 'Join the room'
              : mode === 'configure'
                ? 'Choose game'
                : playWith === 'bots' || (autoStart && game.playMode !== 'solo')
                  ? 'Play game'
                  : 'Create room'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
