import { z } from 'zod';
import type { components } from './generated/schema';

type Wire = components['schemas'];

const id = z.string().min(1).max(64);
const name = z.string().min(1).max(60);

/**
 * The organiser's Secret Santa view. Every object is strict on purpose: who drew
 * whom must never reach the organiser, so an unexpected field (a recipient on a
 * person, an assignment map) fails here instead of travelling into the table.
 */
const santaSchema = z
  .object({
    title: z.string().max(120),
    // Days since 1 January 2020, or null while no date is set.
    day: z.number().int().min(0).max(40000).nullable(),
    location: z.string().max(160),
    budget: z.string().max(60),
    people: z.array(z.object({ id, name, opened: z.boolean() }).strict()).max(60),
    pairs: z.array(z.tuple([id, id])),
    groups: z.array(z.object({ id, label: name, members: z.array(id) }).strict()).max(16),
    drawn: z.boolean(),
    draw_number: z.number().int().nonnegative(),
    can_draw: z.boolean(),
    blocked: z.string().max(400).nullable(),
    // Pass-the-phone only: the one draw the organiser asked to show on this screen.
    showing: z.object({ giver: id, giver_name: name, recipient_name: name }).strict().nullable(),
    limits: z
      .object({
        people: z.number().int().positive(),
        groups: z.number().int().positive(),
        name: z.number().int().positive(),
        title: z.number().int().positive(),
        location: z.number().int().positive(),
        budget: z.number().int().positive(),
      })
      .strict(),
  })
  .strict();

/** Validate the organiser's projection before it enters the Secret Santa table. */
export function santaDetails(detail: Wire['GameView']['detail']) {
  const data = santaSchema.parse(detail);
  return {
    title: data.title,
    day: data.day,
    location: data.location,
    budget: data.budget,
    people: data.people,
    pairs: data.pairs,
    groups: data.groups,
    drawn: data.drawn,
    drawNumber: data.draw_number,
    canDraw: data.can_draw,
    blocked: data.blocked,
    showing: data.showing
      ? {
          giver: data.showing.giver,
          giverName: data.showing.giver_name,
          recipientName: data.showing.recipient_name,
        }
      : null,
    limits: data.limits,
  };
}
export type SantaDetails = ReturnType<typeof santaDetails>;
export type SantaPerson = SantaDetails['people'][number];
export type SantaGroup = SantaDetails['groups'][number];

/** A private link token: URL-safe characters only, so it is always one path segment. */
export const santaTokenPattern = /^[A-Za-z0-9_-]{20,120}$/;

const linksSchema = z.object({
  links: z
    .array(z.object({ id, name, token: z.string().regex(santaTokenPattern) }).strict())
    .max(60)
    .default([]),
});

/** One private link per person. Only the organiser ever receives these. */
export function mapSantaLinks(wire: Wire['SantaLinks']) {
  return linksSchema.parse(wire).links;
}
export type SantaLink = ReturnType<typeof mapSantaLinks>[number];

const revealSchema = z
  .object({
    title: z.string().max(120),
    day: z.number().int().min(0).max(40000).nullish(),
    location: z.string().max(160).default(''),
    budget: z.string().max(60).default(''),
    giver_name: name,
    recipient_name: name,
  })
  .strict();

/** What one person's private link shows: their own draw and the event, nothing else. */
export function mapSantaReveal(wire: Wire['SantaReveal']) {
  const data = revealSchema.parse(wire);
  return {
    title: data.title,
    day: data.day ?? null,
    location: data.location,
    budget: data.budget,
    giverName: data.giver_name,
    recipientName: data.recipient_name,
  };
}
export type SantaReveal = ReturnType<typeof mapSantaReveal>;
