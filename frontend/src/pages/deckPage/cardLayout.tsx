import './cardLayout.css'

function CardLayout(){
    return (
        <div className='cards'>
            <ul className='cardDisplay'>
                <li>Carte 1</li>
                <li>carte 2</li>
                <li>Carte 3</li>
            </ul>
            <button id='addCard'>Ajouter une carte</button>
        </div>
    )
}

export default CardLayout