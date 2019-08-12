# activity-report

Parse a CSV of Apple Watch activity data to see a report of your year-over-year data.

The [Activity++](https://apps.apple.com/us/app/activity/id1089666978) app can generate a CSV of this data.

```sh
npx activity-report Export.csv
```

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
