import chalk from 'chalk'

const colors = [
  chalk.blue,
  chalk.cyan,
  chalk.green,
  chalk.magenta,
  chalk.red,
  chalk.yellow,
  chalk.white
]

function randomChalkColor() {
  const index = Math.floor(Math.random() * ((colors.length - 1) - 0));
  return colors[index]
}

export {randomChalkColor} 