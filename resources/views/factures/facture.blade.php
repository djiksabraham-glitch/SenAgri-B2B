<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">

<style>

body{
    font-family: DejaVu Sans, sans-serif;
    font-size:14px;
    color:#333;
}

h1{
    text-align:center;
    color:#2E7D32;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

table th{
    background:#2E7D32;
    color:white;
    padding:8px;
}

table td{
    border:1px solid #ccc;
    padding:8px;
}

.info{
    margin-top:20px;
}

.footer{
    margin-top:40px;
    text-align:center;
    font-size:12px;
    color:#777;
}

.total{
    margin-top:25px;
    text-align:right;
    font-size:18px;
    font-weight:bold;
}

</style>

</head>

<body>

<h1>FACTURE</h1>

<p><strong>N° Facture :</strong> FAC-{{ $commande->id }}</p>

<p><strong>Date :</strong> {{ $commande->date_commande }}</p>

<div class="info">

<h3>Acheteur</h3>

<p>

{{ $commande->acheteur->nom }}<br>

{{ $commande->acheteur->email }}

</p>

</div>

<div class="info">

<h3>Vendeur</h3>

<p>

{{ $commande->offre->vendeur->nom }}<br>

{{ $commande->offre->vendeur->email }}

</p>

</div>

<table>

<tr>

<th>Produit</th>

<th>Quantité</th>

<th>Prix unitaire</th>

<th>Total</th>

</tr>

<tr>

<td>{{ $commande->offre->nom }}</td>

<td>{{ $commande->quantite }}</td>

<td>{{ number_format($commande->offre->prix_unitaire,0,' ',' ') }} FCFA</td>

<td>{{ number_format($commande->prix_total,0,' ',' ') }} FCFA</td>

</tr>

</table>

<div class="total">

Montant total :
{{ number_format($commande->prix_total,0,' ',' ') }} FCFA

</div>

<div class="footer">

Merci de votre confiance.

<br>

Plateforme SenAgri B2B

</div>

</body>

</html>