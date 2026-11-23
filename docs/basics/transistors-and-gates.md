# Transistors as switches, and logic gates built from them

Every logic chip in this computer is made of transistors. This page shows
how one NPN transistor works as a switch, and how a few of them make the NOT,
AND and OR gates used in the clock logic.

## The NPN transistor as a switch (2N3904 / BC547)

An NPN transistor has three legs: **collector**, **base** and **emitter**. A
small current into the base lets a much larger current flow from collector to
emitter.

| Base | Transistor | Collector to emitter |
|------|------------|----------------------|
| Below about 0.7 V, no base current | **OFF** | Open (no current) |
| Base current flowing | **ON (saturated)** | Nearly a short; collector drops to about 0.2 V |

### Calculation: base resistor to drive an LED

Goal: switch a 20 mA LED from a 5 V logic signal.

| Quantity | Value | Where it comes from |
|----------|-------|---------------------|
| Collector current I_C | 20 mA | LED rated current |
| Minimum current gain h_FE | 100 | 2N3904 datasheet |
| Minimum base current | 20 mA ÷ 100 = **0.2 mA** | |
| Base current with 5× overdrive | **1 mA** | Makes sure it fully switches on |
| Base resistor | (5 − 0.7) V ÷ 1 mA = **4.3 kΩ** | |
| Standard value | **4.7 kΩ** → 0.91 mA | still more than 4× the minimum |

LED series resistor (red, about 2.0 V): (5 − 2.0 − 0.2) V ÷ 20 mA = 140 Ω → **150 Ω**.

## NOT gate: one transistor

| Part | Connection |
|------|------------|
| 4.7 kΩ | Input to base |
| 1 kΩ | +5 V to collector |
| Output | Collector |
| Emitter | Ground |

| IN | Transistor | OUT |
|----|-----------|-----|
| 0 | OFF, so the 1 kΩ pulls OUT up | **1** |
| 1 | ON, so OUT is pulled to about 0.2 V | **0** |

## AND gate: two transistors in series

Q1 and Q2 sit in a chain from +5 V to the output, with 1 kΩ from the output
to ground. Each base has its own 4.7 kΩ resistor from input A or B. Current
reaches the output only if **both** transistors are on.

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | **1** |

## OR gate: two transistors in parallel

Q1 and Q2 each connect +5 V to the output, side by side, with 1 kΩ from the
output to ground. **Either** transistor turning on pulls the output high.

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | **1** |
| 1 | 0 | **1** |
| 1 | 1 | **1** |

## Why we use logic chips instead

Gates built from single transistors are great for learning, but:

- the output voltage drops a little at every gate (about 0.7 V per stage),
- each gate needs 3 to 5 parts and a lot of space,
- they are slow and use more power.

So the computer uses logic chips with several gates per package:

| Chip | Contents | Used in |
|------|----------|---------|
| 74HC04 / 74LS04 | 6 × NOT | Clock logic (Part 4A) |
| 74HC08 / 74LS08 | 4 × 2-input AND | Clock logic (Part 4A) |
| 74HC32 / 74LS32 | 4 × 2-input OR | Clock logic (Part 4A) |

Logic levels at 5 V:

| Family | Input LOW | Input HIGH | Output LOW | Output HIGH |
|--------|-----------|------------|------------|-------------|
| 74LS (TTL) | < 0.8 V | > 2.0 V | < 0.5 V | > 2.7 V |
| 74HC (CMOS) | < 1.5 V | > 3.5 V | < 0.1 V | > 4.9 V |
