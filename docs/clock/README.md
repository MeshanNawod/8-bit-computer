# Module 1: Clock

The clock gives the computer its timing. Every register load, counter step
and RAM write happens on a **rising edge** of this signal. The module has to:

1. **Run automatically** at an adjustable speed.
2. **Single-step**: one button press gives exactly one clean pulse.
3. **Switch** between those two modes without glitches.
4. **Halt** when the program runs the `HLT` instruction.

## Build steps

| Part | What it adds | Tinkercad | Board file | Write-up |
|------|--------------|-----------|------------|----------|
| 1A | Astable 555, fixed resistors (7.18 Hz) | [Open](https://www.tinkercad.com/things/l30rW27OBnZ-astable-555-timer-8-bit-computer-clock-part-1-a) | [.brd](../../hardware/tinkercad/part1a-astable.brd) | [01-astable.md](01-astable.md) |
| 1B | Speed knob: 1 kΩ + 1 MΩ pot (0.72 to 480 Hz) | [Open](https://www.tinkercad.com/things/5Rx0vSOaq2a-astable-555-timer-8-bit-computer-clock-part-1b-) | [.brd](../../hardware/tinkercad/part1b-astable-pot.brd) | [01-astable.md](01-astable.md#part-1b-adjustable-speed) |
| 2A | Monostable 555, debounced step button (110 ms) | [Open](https://www.tinkercad.com/things/hLZbnoHB4L6-monostable-555-timer-8-bit-computer-clock-part-2a) | [.brd](../../hardware/tinkercad/part2a-monostable.brd) | [02-monostable.md](02-monostable.md) |
| 3 | Astable + monostable with a plain select switch | [Open](https://www.tinkercad.com/things/8pzGGpFieEt-bistable-555-timer-8-bit-computer-clock-part-3b) | [.brd](../../hardware/tinkercad/part3-select-switch.brd) | [03-bistable.md](03-bistable.md#part-3-plain-select-switch) |
| 3C | Bistable 555 on its own (debounced switch) | [Open](https://www.tinkercad.com/things/8nKWwN5A36f-monostable-555-timer-8-bit-computer-clock-part-3c) | [.brd](../../hardware/tinkercad/part3c-bistable.brd) | [03-bistable.md](03-bistable.md#part-3c-bistable-555) |
| 3B | All three 555 timers on one board | [Open](https://www.tinkercad.com/things/2x38PAtikeI-bistable-555-timer-8-bit-computer-clock-part-3b) | [.brd](../../hardware/tinkercad/part3b-three-555.brd) | [03-bistable.md](03-bistable.md#part-3b-all-three-timers) |
| 4A | Clock logic: 74HC04, 74HC08, 74HC32 | [Open](https://www.tinkercad.com/things/6YHy5r96IyL-clock-logic-8-bit-computer-clock-part-4a) | [.brd](../../hardware/tinkercad/part4a-clock-logic.brd) · [with HLT switch](../../hardware/tinkercad/part4a-clock-logic-halt.brd) | [04-clock-logic.md](04-clock-logic.md) |

The `.brd` files are the Eagle board exports straight from Tinkercad. All
component values in the write-ups are read from them.

Based on Ben Eater's clock module videos: <https://eater.net/8bit/clock>
