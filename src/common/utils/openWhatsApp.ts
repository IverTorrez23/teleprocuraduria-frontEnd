export const openWhatsApp = (phone: string, message: string) => {
  // Limpiamos el número (remueve espacios, paréntesis, guiones)
  const cleanedPhone = phone.replace(/\D/g, '')
  // Codificamos el mensaje para la URL
  const encodedMessage = encodeURIComponent(message)

  const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedMessage}`
  window.open(url, '_blank')
}
