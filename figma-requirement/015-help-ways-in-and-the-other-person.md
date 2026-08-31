# 015 · One-to-One Help — ways in, and the person who isn't you

**Status:** built in code · `/product/help`
**Contains a crisis-detection fix.** §2 is not a design note; read it.

---

## 1 · The screen's whole job, and the thing it put in the way

This pillar exists to lower the cost of asking for help. It opened with a blank
text field and the words *"Start wherever you want. There's no form."*

For someone who cannot yet name what is wrong — which is most people, most of the time — **a
blank field is the hardest thing you can put in front of them.** The absence of a form was
presented as generosity; it reads as being handed a pen and left alone.

### Ways in

Seven first-person sentences someone might recognise:

> I'm not sleeping · I think I'm burnt out · I feel anxious most days · Something at home is hard
> right now · Someone here is making work difficult · Money is keeping me up at night · **I don't
> know what's wrong, I just feel off**

Deliberately **not** categories. "Anxiety" and "Depression" are labels people will not apply to
themselves at the moment they most need to. The last one carries more weight than the other six:
most people arrive without a name for it.

**Tapping fills the box — it does not send.** The first words on the screen stay theirs to change.
This is the whole reason it works; a chip that fires immediately is a menu, and a menu is a form.

`Help / WaysIn` — chips, plus the same block in its "for someone else" variant.

---

## 2 · The bug this uncovered — read this one

A large share of the people who open a support screen are **not there for themselves.** The page
had no door for them, and testing that door found something worse.

`triage()` reads its input as a first-person account. Typing:

> "my colleague said he wants to die"

produced **"Might be enough on its own"** and the reply *"What would make the next few days a
little easier?"*

The crisis path never fired. `want(ed|ing)?` covered *want*, *wanted*, *wanting* — **not
*wants***. Every third-person expression of intent missed:

| Sentence | Before | Now |
|---|---|---|
| I want to die | acute | acute |
| he wants to die | **missed** | acute |
| she wants to kill herself | **missed** | acute |
| they want to end their life | **missed** | acute |
| my friend doesn't want to be here anymore | **missed** | acute |

This is the second miss of exactly this kind — the first was *"thinking about **ending** my
life"* not matching the literal `end my life`. Both were found by trying sentences, not by
reading the list.

The discriminator that keeps it safe is unchanged and now applies in every person: **the
reflexive, never the object pronoun.** "That project is killing him" is ordinary work speech;
nobody says "this is killing himself."

**25 cases now run on every request to `/api/ai/features`** — 15 that must trip the crisis path,
10 ordinary phrases that must not ("this deadline is killing me", "I could murder a coffee",
"she wants to dye her hair"). The endpoint returns 500 if any fail. They live in the engine
rather than a test file nobody runs, because a miss here is not a bug report — **it is a person
who asked for help and was answered about their work-from-home policy.**

---

## 3 · "For someone else" — a separate door, and a separate intake

Not a filter on the same conversation. The response is about getting help **to the third
person**, and the band is never shown, because the band describes whoever the text is about and
rating the speaker on it is the exact bug above.

**Urgent** — red ground, and five numbered steps in order:

1. Stay with them. Do not leave them on their own.
2. Ask them directly whether they are thinking about ending their life. *Asking does not put the
   idea there — it is the question that lets someone say yes.*
3. Call the crisis line, with them or for advice.
4. If they are in immediate danger, call emergency services.
5. Tell someone you trust.

Then **Try not to** — the part people get wrong with the best intentions: *do not promise to keep
it secret, do not argue the logic of how they feel, do not leave it until tomorrow because today
is awkward.*

**Not urgent** — how to open the conversation: say what you noticed, not what you concluded; ask
twice, because the first "I'm fine" is reflex; let the silence sit.

Both close on the same line: **the person who noticed is allowed support of their own.**

`Help / ConcernAnswer` — urgent and steady variants.

---

## 4 · Three names is not a choice

Three counsellors, three near-identical qualifications, three language lists, a Book button.
Nothing said whether this was the person for what you are carrying — and the credential line,
the most prominent thing after the name, is the least useful, because all three have one.

Added: **what people come to them with** (Anxiety · Burnout · Sleep), one sentence of their own
approach, years, and mode icons.

And **a language filter.** The languages were listed and not actionable. In a workforce spread
across Kerala, Tamil Nadu and Maharashtra, being able to pick the language you want to cry in is
not a nice-to-have. The empty state points at the EAP panel rather than a dead end.

## 5 · Six resources nobody could reach

`matchResources()` only ever fires off the back of a conversation, so the library was invisible
to anyone who had not typed anything — **precisely the person most likely to be here.** It
browses now, in buckets named the way someone describes their own week ("Not sleeping", "Burnt
out"), never as conditions.

## 6 · What actually happens if you book

The page asked for a large step with a button and no explanation. Most of what stops people is
not stigma, it is not knowing the shape of the thing: how long, what it costs, who finds out, is
it recorded, what if it isn't right. Five answers, plainly.

## 7 · What to draw

1. `Help / WaysIn` — both variants
2. `Help / ModeToggle` — For me · For someone else
3. `Help / ConcernAnswer` — **urgent** (danger ground, numbered) and **steady**
4. `Help / Counsellor` — specialisms, approach quote, modes; plus the no-match empty state
5. `Help / Library` — bucket chips and the three resource kinds
6. `Help / SessionFacts` — accordion
7. Keep the crisis strip exactly as it is: **48px targets, not 44** — someone reaching for those
   is not steady-handed
