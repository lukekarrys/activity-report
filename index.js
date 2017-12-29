const CSV = require('csvtojson')
const _ = require('lodash')
const moment = require('moment')
const Table = require('cli-table')

const FILE = process.argv[2] || 'Export'
const TRANSFORM = process.argv[3] || 'metgoal'
const MOVE = +(process.argv[4] || 500)
const MIN_DAYS = +(process.argv[4] || 365)

const TODAY = moment()
const DATE_FORMAT = 'M/D/YY'
const YEAR_FORMAT = 'YYYY'
const TYPES = { TODAY: 'today', MET: 'met', TOTAL: 'total', YEAR: 'year' }
const GOALS = { MOVE, EXERCISE: 30, STAND: 12 }

const pctStr = (obj) => `${obj[TYPES.MET]}/${obj[TYPES.TOTAL]}`
const pct = (obj) => (obj[TYPES.MET] / obj[TYPES.TOTAL] * 100).toFixed(1)

const calculate = (days, goal) => {
  // Get an array of all days from each year that come before todays date
  const beforeToday = _.filter(days, (d) => d.date.clone().year(TODAY.year()).isSameOrBefore(TODAY, 'day'))
  // Return an object of the number of days the goal was met and the total
  const metFrom = (slice) => ({ [TYPES.MET]: _.filter(slice, (d) => d[goal] >= GOALS[goal]).length, [TYPES.TOTAL]: slice.length })
  // For a year return the totals for the year and the year thru today
  return { [TYPES.YEAR]: metFrom(days), [TYPES.TODAY]: metFrom(beforeToday) }
}

const toTable = (data) => {
  // Return a combined array of each GOAL by each TYPE (today, year)
  const goalTypeOrder = (iterator) => _.transform([TYPES.TODAY, TYPES.YEAR], (res, type) => res.push(..._.keys(GOALS).map((goal) => iterator(goal, type))), [])

  // Make a cross table of years X two of each type of goal (today and year to date)
  const table = new Table({ head: ['', ...goalTypeOrder((goal, type) => `${goal} (${type.toUpperCase()})`)] })

  // Add a row for each year
  table.push(..._.map(data, (goals, year) => ({
    [year]: goalTypeOrder((goal, type) => `${pctStr(goals[goal][type])} (${pct(goals[goal][type])}%)`)
  })))

  return table.toString()
}

const transformers = {
  metgoal: calculate,
  sum: (days, goal) => _.sumBy(days, (d) => +d[goal])
}

const thru = {
  metgoal: toTable
}

new CSV().fromFile(`${FILE}.csv`, (err, days) => _.chain(days)
  // Add the date as a moment
  .map((d) => (d.date = moment(d['-'], DATE_FORMAT), d))
  // Group by year
  .groupBy((d) => d.date.format(YEAR_FORMAT))
  // Only full years or the current year are useful
  .pickBy((days, year) => year !== '1969' && days.length >= MIN_DAYS || year === TODAY.format(YEAR_FORMAT))
  // Shape each year object like the GOALS object above
  .transform((res, days, year) => res[year] = _.transform(GOALS, (res, __, goal) => res[goal] = transformers[TRANSFORM](days, goal), []))
  // Make it a table
  .thru(thru[TRANSFORM] || _.identity)
  // Log it
  .tap(console.log)
  // End it
  .value())