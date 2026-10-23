const CardResumo = ({ titulo, valor, descricao, tipo }) => {
  return (
    <article className={`card ${tipo}`}>
      <p>{titulo}</p>
      <h2>{valor}</h2>
      <span>{descricao}</span>
    </article>
  )
}

export { CardResumo }
