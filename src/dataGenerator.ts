import faker from 'faker-br'

function processData(data: Object): Object {
  const keys = Object.keys(data)
  const newObj = {}
  keys.forEach((key) => {
    let keyName = key
    if(key.slice(0, 5) === 'fake:'){
      keyName = key.slice(5)
      const entry = {[keyName]: generateInfo(keyName)}
      Object.assign(newObj, entry)
    }else {
      const entry = {[keyName]: data[keyName]}
      Object.assign(newObj, entry)
    }
  })
  return newObj 
}

function generateInfo(type: string): string{
  switch(type){
    case "cpf": 
      return faker.br.cpf()
    case "name":
      return faker.name.findName()
    case "email":
      return faker.internet.email()
    case "phone":
      return "11999356578"
    case "gender":
      return 'male'
    default:
      return ""
  }
}

export {processData}