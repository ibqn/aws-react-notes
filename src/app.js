import { useEffect, useReducer } from 'react'
import { API } from 'aws-amplify'
import { listNotes as LIST_NOTES } from './graphql/queries'
import styled from 'styled-components'
import { List, Button, Input } from 'antd'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

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
    <Container>
      <Formik
        initialValues={{ name: '', description: '' }}
        validationSchema={Yup.object({
          name: Yup.string().required('name is required'),
          description: Yup.string().required('description is required'),
        })}
        onSubmit={(values) => console.log(values)}
      >
        <Form>
          <fieldset>
            <FormBlock>
              <Label htmlFor="name">
                Name
                <Field
                  name="name"
                  id="name"
                  placeholder="note's name"
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
                  placeholder="note's description"
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
