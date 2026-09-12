function OffreCard({offre}){


return (

<div className="offre-card">


    <img 
        src={
            offre.images?.length > 0 
            ? offre.images[0].url
            : "/image-default.png"
        }
        alt={offre.nom}
    />


    <div>

        <h3>
            {offre.nom}
        </h3>


        <p>
            {offre.description}
        </p>


        <strong>
            {offre.prix_unitaire} FCFA
        </strong>


    </div>


</div>


);


}


export default OffreCard;