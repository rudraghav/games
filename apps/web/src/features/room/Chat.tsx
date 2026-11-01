'use client';
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Avatar, Button } from '@games/ui';
import type { Room } from '@games/api-client';

interface ChatProps {
  room: Room;
  selfId: string;
  send: (body: string, kind: 'message' | 'reaction') => Promise<void>;
  pending: boolean;
}
export function Chat({ room, selfId, send, pending }: ChatProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [room.messages.length]);
  async function submit(text: string, kind: 'message' | 'reaction') {
    setError('');
    try {
      await send(text, kind);
      if (kind === 'message') setBody('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not send your message.');
    }
  }
  return (
    <section className="chat" aria-label="Room chat">
      <div className="chat-heading">
        <h2 className="heading-sm">The conversation</h2>
        <span className="small muted">Just this room</span>
      </div>
      <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
        {!room.messages.length ? (
          <p className="chat-empty">
            The table’s open.
            <br />
            No messages yet.
          </p>
        ) : (
          room.messages.map((message) => {
            const member = room.members.find((member) => member.id === message.userId);
            return (
              <div key={message.id} className="chat-message" data-own={message.userId === selfId}>
                <Avatar size="sm" name={member?.name || 'Player'} seed={member?.avatar} />
                <div>
                  <strong>{member?.name || 'Player'}</strong>
                  <p data-reaction={message.kind === 'reaction'}>{message.body}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={end} />
      </div>
      <div className="chat-reactions" role="group" aria-label="Send a reaction">
        {['❤️', '😂', '🔥', '👏', '😮', '🎉'].map((reaction) => (
          <button
            key={reaction}
            aria-label={`Send ${reaction} reaction`}
            disabled={pending}
            onClick={() => void submit(reaction, 'reaction')}
          >
            {reaction}
          </button>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) void submit(body.trim(), 'message');
        }}
      >
        <input
          className="input"
          aria-label="Message your room"
          maxLength={300}
          placeholder="Say something…"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button
          size="icon"
          aria-label="Send message"
          type="submit"
          disabled={!body.trim() || pending}
        >
          <Send size={17} />
        </Button>
      </form>
      {error ? (
        <p className="error-note" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
