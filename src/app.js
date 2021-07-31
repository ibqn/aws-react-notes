import { useEffect, useReducer } from 'react'
import { API } from 'aws-amplify'
import { listNotes } from './graphql/queries'

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' },
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, loading: false }
    case 'ERROR':
      return { ...state, loading: false, error: true }
    default:
      return state
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await API.graphql({ query: listNotes })

        dispatch({ type: 'SET_NOTES', notes: notesData.data.listNotes.items })
      } catch (error) {
        console.log('error: ', error)
        dispatch({ type: 'ERROR' })
      }
    }

    const notes = [{ id: 'foo', name: 'Hi there!' }]
    dispatch({ type: 'SET_NOTES', notes })
    fetchNotes()
  }, [])

  return (
    <>
      <div>app</div>
      {JSON.stringify(state)}
      {state?.notes?.map((note) => (
        <p key={note.id}>{note.name}</p>
      ))}
    </>
  )
}

export default App
