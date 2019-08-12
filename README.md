# Activity++ Parser

Parse Activity++ data to see the number of days you've met your goals.

## Usage
1. Clone this project
1. `npm install`
1. Export your Activity++ data
1. Save the `Export.csv` to the root of this directory
1. `npm start`

## Output
The output will show days meeting your goal vs total days for each year. It will also differentiate between days thru the current date and the year to date.

```
┌──────┬─────────────────┬──────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│      │ MOVE (TODAY)    │ EXERCISE (TODAY) │ STAND (TODAY)   │ MOVE (YEAR)     │ EXERCISE (YEAR) │ STAND (YEAR)    │
├──────┼─────────────────┼──────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 2016 │ 110/194 (56.7%) │ 130/194 (67.0%)  │ 174/194 (89.7%) │ 210/366 (57.4%) │ 231/366 (63.1%) │ 328/366 (89.6%) │
├──────┼─────────────────┼──────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 2017 │ 108/193 (56.0%) │ 117/193 (60.6%)  │ 175/193 (90.7%) │ 108/193 (56.0%) │ 117/193 (60.6%) │ 175/193 (90.7%) │
└──────┴─────────────────┴──────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### LICENSE
MIT
