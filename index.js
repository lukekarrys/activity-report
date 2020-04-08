#!/usr/bin/env node

const CSV = require("csvtojson")
const _ = require("lodash")
const moment = require("moment")
const Table = require("cli-table")

const FILE = process.argv[2] || "Export"
const TRANSFORM = process.argv[3] || "metgoal"
const MOVE = +(process.argv[4] || 500)

const NOW = moment()
const DATE_FORMAT = "M/D/YY"
const YEAR_FORMAT = "YYYY"
const GOALS = { MOVE, EXERCISE: 30, STAND: 12 }
const GOAL_KEYS = Object.keys(GOALS)
const MAKE_GOAL_OBJECT = (goalValue) =>
  GOAL_KEYS.reduce((acc, goal) => {
    acc[goal] = goalValue(goal)
    return acc
  }, {})

const TODAY = Symbol("TODAY")
const YEAR = Symbol("YEAR")
const numFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
})
const pctFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const formats = {
  ...MAKE_GOAL_OBJECT((goal) => (...args) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits:
        goal === "MOVE"
          ? 0
          : goal === "EXERCISE"
          ? 1
          : goal === "STAND"
          ? 2
          : 0,
    }).format(...args)
  ),
  percent: (...args) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(...args),
}

const toTable = (rows) => {
  // Make a cross table of years X two of each type of goal (today and year to date)
  const table = new Table({
    head: [
      "",
      ...GOAL_KEYS.map((goal) => `${goal} (TODAY)`),
      ...GOAL_KEYS.map((goal) => `${goal} (YEAR)`),
    ],
  })

  table.push(
    ...rows.map((row) => [
      row.year,
      ...GOAL_KEYS.map((goal) => row.data[TODAY][goal].toString()),
      ...GOAL_KEYS.map((goal) => row.data[YEAR][goal].toString()),
    ])
  )

  return table.toString()
}

// Generate data thru today and for the whole year
const goalDataByTodayAndYear = (days, dayGoalValue) => {
  const thruToday = _.filter(days, (d) =>
    d.date.clone().year(NOW.year()).isSameOrBefore(NOW, "day")
  )
  return {
    [TODAY]: MAKE_GOAL_OBJECT((goal) =>
      dayGoalValue({ goal, days: thruToday, type: TODAY })
    ),
    [YEAR]: MAKE_GOAL_OBJECT((goal) =>
      dayGoalValue({ goal, days, type: YEAR })
    ),
  }
}

const daysMetGoal = {
  // Only full years or the current year are useful for counting days met goal
  filterYear: ({ days, year }) =>
    days.length >= 365 || year === NOW.format(YEAR_FORMAT),
  data: ({ days }) =>
    goalDataByTodayAndYear(days, ({ goal, days, type }) => {
      const met = days.filter((day) => day[goal] >= GOALS[goal]).length
      const total = days.length
      return {
        valueOf: () => met / total,
        toString: () =>
          `${met} / ${total}`.padStart(9, " ") +
          ` – (${formats.percent(met / total)})`,
      }
    }),
}

const sumTotal = {
  data: ({ days, year }, index, list) => {
    const daysLeftInYear = moment(`${year}-12-31`).diff(NOW, "days")

    const previousYear =
      list && list[index - 1] && transform.data(list[index - 1])

    return goalDataByTodayAndYear(days, ({ goal, days, type }) => {
      const sum = _.sumBy(days, (day) => +day[goal])
      const avg = sum / days.length
      const f = (...args) => formats[goal](...args)

      let result = `${f(sum)}`
      if (avg) result += ` – ${f(avg)}/day`

      if (type === TODAY && previousYear && index === list.length - 1) {
        const diff = sum - previousYear[TODAY][goal]
        const avgDiff = diff / days.length
        const avgToBeatLastYear =
          (previousYear[YEAR][goal] - sum + 1) / daysLeftInYear

        result += "\n"
        result += f(diff)
        result += ` – ${f(avgDiff)}/day`
        result += `\n${f(avgToBeatLastYear)}/day to beat`
      }

      return {
        valueOf: () => sum,
        toString: () => result,
      }
    })
  },
}

const transform = {
  metgoal: daysMetGoal,
  sum: sumTotal,
}[TRANSFORM]

new CSV().fromFile(FILE, (err, days) =>
  _.chain(days)
    // Add the date as a moment
    .map((d) => ((d.date = moment(d["-"], DATE_FORMAT)), d))
    // Group by year, remap to array, and sort
    .groupBy((d) => d.date.format(YEAR_FORMAT))
    .map((days, year) => ({ year, days }))
    .sortBy("year")
    // Sometimes the CSV has bad data from 1969
    .reject(({ year }) => year === "1969")
    // Filter data out by year if possible
    .filter((obj) => (transform.filterYear ? transform.filterYear(obj) : true))
    // Shape each year object like the GOALS object above
    .map((obj, index, list) => ({
      ...obj,
      data: transform.data(obj, index, list),
    }))
    // Make it a table
    .thru(toTable)
    // Log it
    .tap(console.log)
    // End it
    .value()
)
