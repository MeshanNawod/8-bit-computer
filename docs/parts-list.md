# Parts list

## Module 1: Clock, as built in Tinkercad (Part 4A with HLT switch)

Read from [part4a-clock-logic-halt.brd](../hardware/tinkercad/part4a-clock-logic-halt.brd).

| Qty | Part | Value | Used for |
|-----|------|-------|----------|
| 3 | 555 timer | LM555 (DIP-8) | Astable, monostable, bistable |
| 1 | Hex inverter | 74HC04 | SEL̅ and HLT̅ |
| 1 | Quad AND | 74HC08 | Clock select and halt gating |
| 1 | Quad OR | 74HC32 | Combining the two clock sources |
| 1 | Potentiometer | 1 MΩ | Clock speed |
| 1 | Resistor | 1 MΩ | Monostable timing |
| 5 | Resistor | 1 kΩ | Astable R1, series with pot, button pull-up, 2 bistable pull-ups |
| 4 | Resistor | 220 Ω | LEDs |
| 1 | Electrolytic capacitor | 1 µF | Astable timing |
| 1 | Ceramic capacitor | 0.1 µF | Monostable timing |
| 3 | Ceramic capacitor | 0.1 µF (100 nF) | 555 pin 5 filters |
| 2 | Ceramic capacitor | 0.1 µF | Power-rail decoupling |
| 1 | Push button | momentary | Single step |
| 2 | Slide switch | SPDT | Auto/manual select, HLT |
| 1 | LED | red | CLK output |
| 3 | LED | yellow | Astable, monostable and select indicators |
| 1 | Power supply | 5 V DC | |

Tip: add a 0.1 µF decoupling capacitor next to each logic chip as well, and
tie unused gate inputs to ground.

## Discrete-transistor experiments (optional)

| Qty | Part | Value |
|-----|------|-------|
| 4 | NPN transistor | 2N3904 or BC547 |
| 4 | Resistor | 4.7 kΩ (base) |
| 2 | Resistor | 1 kΩ (collector/emitter) |

Parts for later modules will be added as each one is built.
Ben Eater sells complete kits at <https://eater.net/8bit/kits>.
