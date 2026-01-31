import axios from '@/config/axios'
import type { IVideo } from '../types/video.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  VIDEOS: '/videos',
  listarVideos() {
    return this.VIDEOS + `/listado`
  },
  deleteVideo(id: number) {
    return this.VIDEOS + `/eliminar/${id}`
  },
  getVideosProcurador() {
    return this.VIDEOS + `/procuradores`
  },
  getVideosAbogados() {
    return this.VIDEOS + `/abogados`
  },
  listarVideosUsuarios() {
    return this.VIDEOS + `/listado/usuarios`
  },
})

const getVideos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IVideo[] }> => {
  try {
    const response = await axios.get(ENDPOINT.VIDEOS, {
      params: {
        page: options.page,
        perPage: options.perPage,
        search: JSON.stringify(options.search),
        sort: JSON.stringify(options.sort)
      }
    })

    const data = response.data

    const pagination: IPaginado = {
      rowsPerPage: data.meta.per_page,
      rowsNumber: data.meta.total,
      totalItems: data.meta.total,
      itemCount: data.meta.to,
      perPage: data.meta.per_page,
      currentPage: data.meta.current_page
    }

    return {
      pagination,
      result: data.data
    }
  } catch (error) {
    console.error('Failed to fetch videos', error)
    return CrearRespuestaPaginado()
  }
}
const getVideosProcurador = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IVideo[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getVideosProcurador(), {
      params: {
        page: options.page,
        perPage: options.perPage,
        search: JSON.stringify(options.search),
        sort: JSON.stringify(options.sort)
      }
    })

    const data = response.data

    const pagination: IPaginado = {
      rowsPerPage: data.meta.per_page,
      rowsNumber: data.meta.total,
      totalItems: data.meta.total,
      itemCount: data.meta.to,
      perPage: data.meta.per_page,
      currentPage: data.meta.current_page
    }

    return {
      pagination,
      result: data.data
    }
  } catch (error) {
    console.error('Failed to fetch videos', error)
    return CrearRespuestaPaginado()
  }
}
const getVideosAbogados = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IVideo[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getVideosAbogados(), {
      params: {
        page: options.page,
        perPage: options.perPage,
        search: JSON.stringify(options.search),
        sort: JSON.stringify(options.sort)
      }
    })

    const data = response.data

    const pagination: IPaginado = {
      rowsPerPage: data.meta.per_page,
      rowsNumber: data.meta.total,
      totalItems: data.meta.total,
      itemCount: data.meta.to,
      perPage: data.meta.per_page,
      currentPage: data.meta.current_page
    }

    return {
      pagination,
      result: data.data
    }
  } catch (error) {
    console.error('Failed to fetch videos', error)
    return CrearRespuestaPaginado()
  }
}
const listarVideos = async () => {
  const response = await axios
    .get<{ data: IVideo[] }>(`${ENDPOINT.listarVideos()}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarVideosUsuarios = async () => {
  const response = await axios
    .get<{ data: IVideo[] }>(`${ENDPOINT.listarVideosUsuarios()}`)
    .catch(() => undefined)

  return response?.data.data
}
const createVideo = async (video: Omit<IVideo, 'id'>) => {
  const response = await axios
    .post<{ response: IVideo }>(ENDPOINT.VIDEOS, video)
    .catch(() => undefined)

  return response?.data?.response
}

const updateVideo = async (video: IVideo) => {
  if (!video.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IVideo }>(`${ENDPOINT.VIDEOS}/${video.id}`, video)
    .catch(() => undefined)

  return response?.data.response
}

const deleteVideo = async (video: IVideo) => {
  if (!video?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteVideo(video.id)).catch(() => undefined)

  return !!response
}

export default {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  listarVideos,
  getVideosProcurador,
  getVideosAbogados,
  listarVideosUsuarios
}
