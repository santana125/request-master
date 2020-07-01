import axios, { AxiosRequestConfig, Method, AxiosInstance, AxiosResponse, } from 'axios'

import chalk from 'chalk'
import { randomChalkColor } from './chalkCustomMethods';

interface IIteration {
  status: number,
  timeLapsed: number
}
interface IConfig extends AxiosRequestConfig {
  metadata: {
    endTime: Date,
    startTime: Date
  }
}
interface IResponse extends AxiosResponse {
  duration: number,
  config: IConfig
}
interface IConfig {
  url: string,
  name: string,
  method: Method,
  repetitions: number,
  body: object | undefined
}

class Requester {
  URL: string;
  name: string;
  method: Method;
  repetitions: number;
  results: Array<IIteration> = [];
  api: AxiosInstance;

  constructor (config: IConfig) {
    this.name = config.name
    this.URL = config.url
    this.method = config.method
    this.repetitions = config.repetitions
    this.api = axios.create({url: config.url})

    this.api.interceptors.request.use(function (config) {
      ( config as any).metadata = { startTime: new Date()}
      return config;
    }, function (error) {
      return Promise.reject(error);
    });

    this.api.interceptors.response.use(function (res) {
      const response = (res as IResponse);
      response.config.metadata.endTime = new Date();
      response.duration = response.config.metadata.endTime.getTime() - response.config.metadata.startTime.getTime()
      return response;
    }, function (error) {
      error.config.metadata.endTime = new Date();
      error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
      return Promise.reject(error);
    });
  }

  async call(index: number): Promise<any> {
      try {
        const res = await this.api({
          method: this.method
        })
        const response = (res as IResponse)
        this.results[index] = {
          status: response.status,
          timeLapsed: response.duration
        }
      } catch (error) {
        const response = (error.response as IResponse)
        this.results[index] = {
          status: response.status,
          timeLapsed: error.duration
        }
      }
  }

  async runAll(): Promise<any> {
    const tasks = this.prepareTasks()
    const result = Promise.all(tasks).then(
      resp => {return resp}
    )
    .catch(err => Promise.reject(err))
    return result
  }

  prepareTasks(): any {
    console.log(`Creating ${this.repetitions} tasks for ${this.name}.`)
    const tasks: Array<any> = []

    for(let i = 0; i < this.repetitions; i++){
      tasks.push(this.call(i))
    }
    return tasks
  }


  showResults(): void {
    const chalkColor = randomChalkColor();
    console.log(`---. ${chalkColor(this.name)}: .---`)
    this.results.map(result => {
      let status: string

      switch(String(result.status)[0]){
        case '2':
          status = chalk.green(result.status)
          break
        case '3':
          status = chalk.yellow(result.status)
          break
        case '4':
          status = chalk.red(result.status)
          break
        default: 
          status = chalk.blue.bgGray(result.status)
      }

      console.log(`${chalk.bold.blue('STATUS:')} ${status} - ${result.timeLapsed / 1000} seconds`)
    })
  }
}

async function main() {
  const requests = require('./requests.json')

  const queue = requests.map((config: IConfig) => {
    const item = new Requester(config)
    return item 
  })
  const start = new Date()

  const taskItems: Array<any> = []
  queue.forEach((item: Requester) => {
    console.log('running')
    taskItems.push(item.runAll())
  });

  Promise.all(taskItems)
    .then( () => {
      queue.forEach((item: Requester) => {
        item.showResults()
      });
      const end = new Date()
      const diff = end.getTime() - start.getTime()
      console.log(diff / 1000)
    }
  )
}

main()