import { enqueueSnackbar } from 'notistack'

export function displayError(...messageParts: string[]) {
  enqueueSnackbar(messageParts.join(': '), { variant: 'error' })
}
