# Module 1: Clock

The clock gives the computer its timing. Every register load, counter step
and RAM write happens on a **rising edge** of this signal. The module needs
to do three things:

1. **Run automatically** at an adjustable speed, from under 1 Hz (so you can
   watch each step) up to a few hundred Hz.
2. **Single-step** with a push button: one press gives exactly one clean
   pulse.
3. **Halt** when the program runs the `HLT` instruction.

## Build status

| Part | What it does | Status | Write-up | Tinkercad |
|------|--------------|--------|----------|-----------|
| 1a | Astable 555, fixed resistors (7.18 Hz) | ✅ Simulated | [01-astable.md](01-astable.md) | [Link](https://www.tinkercad.com/things/l30rW27OBnZ-astable-555-timer-8-bit-computer-clock-part-1-a) |
| 1b | Astable 555 + 1 MΩ pot (0.72 to 480 Hz) | ✅ Simulated | [01-astable.md#part-1b-adjustable-speed](01-astable.md#part-1b-adjustable-speed) | [Link](https://www.tinkercad.com/things/5Rx0vSOaq2a-astable-555-timer-8-bit-computer-clock-part-1b-) |
| 2 | Monostable 555, debounced step button (110 ms) | ✅ Simulated | [02-monostable.md](02-monostable.md) | [Link](https://www.tinkercad.com/things/hLZbnoHB4L6-monostable-555-timer-8-bit-computer-clock-part-2) |
| 3 | Astable + monostable + SPDT select switch | ✅ Simulated | [03-bistable.md](03-bistable.md) | [Link](https://www.tinkercad.com/things/8pzGGpFieEt-bistable-555-timer-8-bit-computer-clock-part-3) |
| 3+ | Bistable 555 to debounce the select switch | ⏳ Next | [03-bistable.md#the-fix-a-bistable-555-next-step](03-bistable.md#the-fix-a-bistable-555-next-step) | — |
| 4 | Gate logic (74LS04/08/32) + HLT input | ⏳ Next | [04-clock-logic.md](04-clock-logic.md) | — |

## Target design (Ben Eater)

```
 ┌──────────────────┐  AST
 │ 555 #1 Astable   │──────────┐
 └──────────────────┘          │
 ┌──────────────────┐  MONO    ▼
 │ 555 #2 Monostable│───► ┌──────────────┐
 └──────────────────┘     │ Select logic │──► CLK
 ┌──────────────────┐ SEL │ 74LS04/08/32 │──► CLK̅
 │ 555 #3 Bistable  │───► └──────────────┘
 └──────────────────┘          ▲
                         HLT ──┘  (from the control logic)
```

Tinkercad board exports (Eagle `.brd`) for every part are in
[`hardware/tinkercad/`](../../hardware/tinkercad).

Based on Ben Eater's clock module videos: <https://eater.net/8bit/clock>
