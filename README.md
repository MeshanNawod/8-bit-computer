# 8-Bit Breadboard Computer

An 8-bit computer built from logic ICs (74LS series), 555 timers and discrete
transistors, simulated first in Tinkercad Circuits and documented step by step,
with the reasoning and calculations behind each part.

> **Credit:** This project follows the design of **Ben Eater's 8-bit breadboard
> computer**. The architecture, module breakdown and most of the circuit ideas
> are his. Go watch the original series. It is one of the best ways to learn
> how a computer works:
> - Website: <https://eater.net/8bit>
> - YouTube playlist: <https://www.youtube.com/playlist?list=PLowKtXNTBypGqImE405J2565dvjafglHU>
>
> What's mine here: the Tinkercad simulations, the write-ups, and the
> worked calculations.

---

## Architecture overview

```
            ┌──────────────────────── 8-bit BUS ────────────────────────┐
            │                                                            │
 ┌───────┐  │  ┌──────────────┐   ┌──────────────┐   ┌───────────────┐   │
 │ CLOCK │──┼─▶│ Program      │   │ A Register   │──▶│               │   │
 └───────┘  │  │ Counter (PC) │   └──────────────┘   │  ALU (+ / −)  │───┤
            │  └──────────────┘   ┌──────────────┐   │               │   │
            │  ┌──────────────┐   │ B Register   │──▶│               │   │
            ├─▶│ Memory Addr  │   └──────────────┘   └───────────────┘   │
            │  │ Register     │   ┌──────────────┐   ┌───────────────┐   │
            │  └──────┬───────┘   │ Instruction  │──▶│ Control Logic │   │
            │         ▼           │ Register     │   │ (microcode)   │   │
            │  ┌──────────────┐   └──────────────┘   └───────────────┘   │
            └─▶│ RAM (16 B)   │   ┌──────────────┐                       │
               └──────────────┘   │ Output (7seg)│◀──────────────────────┘
                                  └──────────────┘
```

Every module talks to the others over a shared 8-bit bus. Each clock pulse,
the control logic enables one module to *write* to the bus and one or more
modules to *read* from it.

## Build progress

| # | Module | Main ICs | Status | Docs |
|---|--------|----------|--------|------|
| 1 | Clock | NE555 ×3, 74LS04, 74LS08, 74LS32 | ✅ Simulated | [Clock docs](docs/clock/README.md) |
| 2 | Registers (A, B, IR) | 74LS173, 74LS245 | ⏳ Planned | — |
| 3 | ALU (add/subtract) | 74LS283, 74LS86 | ⏳ Planned | — |
| 4 | RAM + memory address register | 74LS189, 74LS157, 74LS173 | ⏳ Planned | — |
| 5 | Program counter | 74LS161 | ⏳ Planned | — |
| 6 | Output display | 28C16 EEPROM, 74LS273, 7-segment | ⏳ Planned | — |
| 7 | Control logic | 28C16 EEPROM ×2, 74LS161, 74LS138 | ⏳ Planned | — |

## Module 1: Clock (done)

The clock is the computer's heartbeat. It has three 555 timers, each wired in a
different mode, plus some logic gates:

| Part | Tinkercad | Write-up |
|------|-----------|----------|
| 1a: Astable 555 (free-running clock) | [Open](https://www.tinkercad.com/things/l30rW27OBnZ-astable-555-timer-8-bit-computer-clock-part-1-a) | [01-astable.md](docs/clock/01-astable.md) |
| 1b: Astable 555 (adjustable speed) | [Open](https://www.tinkercad.com/things/5Rx0vSOaq2a-astable-555-timer-8-bit-computer-clock-part-1b-) | [01-astable.md](docs/clock/01-astable.md#part-1b-adjustable-speed) |
| 2: Monostable 555 (debounced step button) | [Open](https://www.tinkercad.com/things/hLZbnoHB4L6-monostable-555-timer-8-bit-computer-clock-part-2) | [02-monostable.md](docs/clock/02-monostable.md) |
| 3: Bistable 555 (auto/manual switch) | [Open](https://www.tinkercad.com/things/8pzGGpFieEt-bistable-555-timer-8-bit-computer-clock-part-3) | [03-bistable.md](docs/clock/03-bistable.md) |
| Clock-select logic | — | [04-clock-logic.md](docs/clock/04-clock-logic.md) |

> **Note on component values:** the worked calculations use the reference
> values from Ben Eater's clock module (for example R1 = 1 kΩ, a 1 MΩ pot and
> C = 1 µF). If a Tinkercad circuit uses different parts, plug its values into
> the same formulas.

## Background reading in this repo

- [How the 555 timer works inside](docs/basics/555-timer.md)
- [Transistors as switches, and building logic gates from them](docs/basics/transistors-and-gates.md)
- [LED current-limiting resistors](docs/basics/led-resistors.md)
- [Parts list](docs/parts-list.md)

## Repository layout

```
.
├── README.md                ← you are here
├── docs/
│   ├── basics/              ← 555 internals, transistors, LEDs
│   ├── clock/               ← Module 1 write-ups and calculations
│   └── parts-list.md
└── LICENSE
```

## Credits

- **Ben Eater** ([eater.net](https://eater.net), [YouTube](https://www.youtube.com/@BenEater)):
  original 8-bit computer design and video series this project follows.
- Simulations built in [Autodesk Tinkercad Circuits](https://www.tinkercad.com/circuits).
- Datasheets: Texas Instruments NE555, SN74LS00-series.

## License

Documentation and simulations: [MIT](LICENSE). The original 8-bit computer
design belongs to Ben Eater; see his site for his terms.
