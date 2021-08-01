import { useEffect, useReducer } from 'react'
import { API } from 'aws-amplify'
import { listNotes as LIST_NOTES } from './graphql/queries'
import {
  createNote as CREATE_NOTE,
  deleteNote as DELETE_NOTE,
} from './graphql/mutations'
import styled from 'styled-components'
import { List, Button, Input } from 'antd'
import { v4 as uuid } from 'uuid'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const CLIENT_ID = uuid()

const initialState = {
  notes: [],
  loading: true,
  error: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, loading: false }
    case 'ERROR':
      return { ...state, loading: false, error: true }
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] }

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

const InputField = styled(Input)``

const Label = styled.label`
  margin-bottom: 20px;
`
const FormBlock = styled.div`
  height: 60px;
  margin-bottom: 20px;
`

const ErrorField = styled.span`
  color: coral;
`

const P = styled.p`
  color: #1890ff;
  cursor: pointer;
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

    const notes = [{ id: uuid(), name: 'Hi there!' }]
    dispatch({ type: 'SET_NOTES', notes })

    fetchNotes()
  }, [])

  const createNote = async (noteData) => {
    const note = {
      ...noteData,
      clientId: CLIENT_ID,
      completed: false,
      id: uuid(),
    }

    try {
      await API.graphql({ query: CREATE_NOTE, variables: { input: note } })
      console.log('successfully created note')
    } catch (error) {
      console.log('error: ', error)
    }

    dispatch({ type: 'ADD_NOTE', note })
  }

  const deleteNote = async ({ id }) => {
    const notes = state.notes.filter((note) => note.id !== id)

    try {
      await API.graphql({ query: DELETE_NOTE, variables: { input: { id } } })
      console.log('successfully deleted note')
    } catch (error) {
      console.log('error: ', error)
    }

    dispatch({ type: 'SET_NOTES', notes })
  }

  const renderItem = (item) => (
    <ListItem actions={[<P onClick={() => deleteNote(item)}>Delete</P>]}>
      <List.Item.Meta
        title={item.name}
        description={item.description}
      ></List.Item.Meta>
    </ListItem>
  )

  return (
    <Container>
      <Formik
        initialValues={{ name: '', description: '' }}
        validationSchema={Yup.object({
          name: Yup.string().required('name is required'),
          description: Yup.string().required('description is required'),
        })}
        onSubmit={async (noteData, { resetForm }) => {
          console.log(noteData)

          await createNote(noteData)
          resetForm()
        }}
      >
        <Form>
          <fieldset>
            <FormBlock>
              <Label htmlFor="name">
                Name
                <Field
                  name="name"
                  id="name"
                  placeholder="Note name"
                  as={InputField}
                />
              </Label>
              <ErrorMessage name="name" component={ErrorField} />
            </FormBlock>

            <FormBlock>
              <Label htmlFor="description">
                Description
                <Field
                  name="description"
                  id="description"
                  placeholder="Note description"
                  as={InputField}
                />
              </Label>
              <ErrorMessage name="description" component={ErrorField} />
            </FormBlock>

            <Button type="primary" htmlType="submit">
              Create Note
            </Button>
          </fieldset>
        </Form>
      </Formik>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      ></List>
    </Container>
  )
}

export default App
