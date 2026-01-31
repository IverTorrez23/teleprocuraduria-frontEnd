import axios from '@/config/axios'

const ENDPOINT = Object.freeze({
  POSTS: 'posts'
})

const obtenerPosts = async (): Promise<any[]> => {
  try {
    const respuesta = await axios.get(ENDPOINT.POSTS)
    return respuesta.data
  } catch (error) {
    console.error('Error fetching posts:', error)

    throw error
  }
}

export const BilleteraService = Object.freeze({
  obtenerPosts
})
