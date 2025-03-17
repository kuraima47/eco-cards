import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Plus } from "lucide-react";

import './categories.css'

function Categories(){

    const [showTextarea, setShowTextarea] = useState(false);


    const showButton = (
        <Button onClick={() => setShowTextarea(true)}>Ajouter une catégorie</Button>
    );

    const textareaWithButton = (
        <div className="flex flex-col items-center gap-2">
          <textarea placeholder="Saisissez votre texte ici..." className="w-80 h-32" />
          <Button variant="outline" onClick={() => setShowTextarea(false)}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>
    );
    

    return (
        <div className='categories'>
            <ul className='categoryNames'>
                <li>Catégorie 1</li>
                <li>Catégorie 2</li>
                <li>Catégorie 3</li>
            </ul>
            {showTextarea ? textareaWithButton : showButton}
        </div>
    )
}

export default Categories