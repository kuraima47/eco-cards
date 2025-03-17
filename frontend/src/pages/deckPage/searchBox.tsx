import './searchBox.css'

function SearchBox() {
    return (
        <>
            <input type="text" id="search" placeholder="Cherchez une carte"/>
            <div className="cardSearched">
                <ul id="proposedCards">

                </ul>
            </div> 
        </>
    )
}

export default SearchBox