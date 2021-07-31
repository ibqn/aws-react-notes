import { useEffect, useReducer } from 'react'
import { API } from 'aws-amplify'
import { listNotes as LIST_NOTES } from './graphql/queries'
import styled from 'styled-components'
import { List } from 'antd'

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

const ListItem = styled(List.Item)`
  text-align: left;
`

const Container = styled.div`
  padding: 20px;
`

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await API.graphql({ query: LIST_NOTES })

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

  const renderItem = (item) => (
    <ListItem>
      <List.Item.Meta
        title={item.name}
        description={item.description}
      ></List.Item.Meta>
    </ListItem>
  )

  return (
    <>
      <div>app</div>
      {/* {JSON.stringify(state)} */}
      {state?.notes?.map((note) => (
        <p key={note.id}>{note.name}</p>
      ))}
      <Container>
        <List
          loading={state.loading}
          dataSource={state.notes}
          renderItem={renderItem}
        ></List>
      </Container>
    </>
  )
}

export default App
