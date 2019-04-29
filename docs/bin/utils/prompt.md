





  

```js
import prompts from 'prompts'

export const PROMPT_TYPE = {
  askPassword: 'password',
  askOverwrite: 'overwrite',
  confirm: 'confirm'
}

const PROMPT_SCHEMA = {
  [PROMPT_TYPE.askOverwrite]: () => ({ name: 'value', message: 'File with that name already exist, do you want to overwrite?', type: 'confirm', initial: true }),
  [PROMPT_TYPE.askPassword]: () => ({ name: 'password', message: 'Enter your password', type: 'password' }),
  [PROMPT_TYPE.confirm]: ({ message }) => ({ name: 'value', message, type: 'confirm' })
}

export const prompt = async (type, params) => {
  const schema = PROMPT_SCHEMA[type](params)
  if (!schema) throw new Error('Prompt schema not found')
  const r = (await prompts(schema))[schema.name]
  if (typeof r === 'undefined') process.exit(0) // Canceled `ctrl + c`
  return r
}


```




