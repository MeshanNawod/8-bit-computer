# Parts list

## Module 1: Clock, as built in Tinkercad (Part 3)

Taken from [part3-clock-select.brd](../hardware/tinkercad/part3-clock-select.brd).

| Qty | Ref | Part | Value | Where |
|-----|-----|------|-------|-------|
| 2 | U1, U2 | 555 timer | LM555 (DIP-8) | U2 astable, U1 monostable |
| 1 | RPOT2 | Potentiometer | 1 MΩ | Clock speed |
| 1 | R6 | Resistor | 1 MΩ | Monostable timing |
| 3 | R1, R3, R4 | Resistor | 1 kΩ | Astable R1, series with pot, button pull-up |
| 4 | R2, R5, R7, R8 | Resistor | 220 Ω | LEDs (R8 is unused, see Part 3 notes) |
| 1 | C3 | Electrolytic capacitor | 1 µF | Astable timing |
| 1 | C5 | Ceramic capacitor | 0.1 µF | Monostable timing |
| 2 | C1, C6 | Ceramic capacitor | 0.1 µF | 555 pin 5 filters |
| 2 | C2, C4 | Ceramic capacitor | 0.1 µF | Power-rail decoupling |
| 1 | S1 | Push button | momentary | Single step |
| 1 | S2 | Slide/toggle switch | SPDT | Auto/manual select |
| 1 | D1 | LED | red | Astable output |
| 2 | D2, D3 | LED | yellow | Monostable output, selected clock |
| 1 | — | Power supply | 5 V DC | Bench supply in the simulation |

## Still to add for the full clock module

| Qty | Part | Value | For |
|-----|------|-------|-----|
| 1 | 555 timer | LM555 | Bistable debounce of the select switch |
| 2 | Resistor | 1 kΩ | Bistable pull-ups |
| 1 | Ceramic capacitor | 0.1 µF | Bistable pin 5 filter |
| 1 | Hex inverter | 74LS04 | Clock logic |
| 1 | Quad AND | 74LS08 | Clock logic |
| 1 | Quad OR | 74LS32 | Clock logic |
| 3 | Ceramic capacitor | 0.1 µF | Decoupling for the logic chips |

## Discrete-transistor experiments (optional)

| Qty | Part | Value |
|-----|------|-------|
| 4 | NPN transistor | 2N3904 or BC547 |
| 4 | Resistor | 4.7 kΩ (base) |
| 2 | Resistor | 1 kΩ (collector/emitter) |

Parts for the later modules will be added as each one is built.
Ben Eater sells complete kits at <https://eater.net/8bit/kits>.
