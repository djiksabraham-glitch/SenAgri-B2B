<!DOCTYPE html>
<html lang="fr">

<head>

    <meta charset="UTF-8">

    <style>

        @page {
            margin: 35px 40px 45px 40px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #374151;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }


        /* =========================================================
           COULEURS
        ========================================================= */

        .green {
            color: #15803d;
        }

        .green-dark {
            color: #166534;
        }


        /* =========================================================
           HEADER
        ========================================================= */

        .header {
            width: 100%;
            border-bottom: 2px solid #15803d;
            padding-bottom: 18px;
            margin-bottom: 28px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-left {
            width: 60%;
            vertical-align: middle;
        }

        .header-right {
            width: 40%;
            text-align: right;
            vertical-align: middle;
        }


        /* Logo */

        .logo {
            font-size: 25px;
            font-weight: bold;
            color: #166534;
        }

        .logo-leaf {
            color: #16a34a;
            font-size: 29px;
            vertical-align: middle;
        }

        .logo-subtitle {
            margin-top: 4px;
            color: #6b7280;
            font-size: 10px;
        }


        /* Facture */

        .invoice-title {
            font-size: 26px;
            font-weight: bold;
            color: #166534;
            margin: 0;
        }

        .invoice-number {
            margin-top: 6px;
            color: #6b7280;
            font-size: 11px;
        }


        /* =========================================================
           INFORMATIONS FACTURE
        ========================================================= */

        .invoice-meta {
            width: 100%;
            border-collapse: separate;
            border-spacing: 10px;
            margin: 0 -10px 25px -10px;
        }

        .meta-box {
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            border-radius: 8px;
            padding: 14px;
            vertical-align: top;
        }

        .meta-title {
            font-size: 10px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 7px;
        }

        .meta-value {
            font-size: 12px;
            color: #1f2937;
            line-height: 1.6;
        }


        /* =========================================================
           ACHETEUR / VENDEUR
        ========================================================= */

        .parties {
            width: 100%;
            border-collapse: separate;
            border-spacing: 12px;
            margin: 0 -12px 25px -12px;
        }

        .party-box {
            width: 50%;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 9px;
            padding: 16px;
            vertical-align: top;
        }

        .party-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #16a34a;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .party-name {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }

        .party-email {
            color: #6b7280;
            font-size: 11px;
        }


        /* =========================================================
           TABLE PRODUIT
        ========================================================= */

        .products {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border: 1px solid #e5e7eb;
        }

        .products thead {
            background: #166534;
        }

        .products th {
            color: #ffffff;
            font-size: 10px;
            text-transform: uppercase;
            padding: 11px 10px;
            text-align: left;
        }

        .products th.right {
            text-align: right;
        }

        .products td {
            padding: 14px 10px;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
        }

        .products td.right {
            text-align: right;
        }

        .product-name {
            font-weight: bold;
            color: #1f2937;
            font-size: 12px;
        }

        .product-description {
            color: #9ca3af;
            font-size: 9px;
            margin-top: 3px;
        }


        /* =========================================================
           TOTAL
        ========================================================= */

        .total-container {
            width: 100%;
            margin-top: 20px;
        }

        .total-table {
            width: 100%;
            border-collapse: collapse;
        }

        .total-label {
            text-align: right;
            color: #6b7280;
            padding: 6px;
        }

        .total-value {
            width: 180px;
            text-align: right;
            padding: 6px;
            color: #374151;
        }

        .grand-total {
            background: #166534;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            padding: 13px 15px;
            text-align: right;
        }


        /* =========================================================
           STATUT
        ========================================================= */

        .status-container {
            margin-top: 25px;
        }

        .status {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            border-radius: 20px;
            padding: 7px 14px;
            font-size: 10px;
            font-weight: bold;
        }


        /* =========================================================
           MESSAGE
        ========================================================= */

        .thank-you {
            margin-top: 30px;
            padding: 16px;
            background: #f8fafc;
            border-left: 4px solid #16a34a;
            color: #64748b;
            font-size: 11px;
            line-height: 1.6;
        }


        /* =========================================================
           FOOTER
        ========================================================= */

        .footer {
            position: fixed;
            bottom: -25px;
            left: 0;
            right: 0;

            border-top: 1px solid #e5e7eb;

            padding-top: 10px;

            text-align: center;

            color: #9ca3af;

            font-size: 9px;
        }

        .footer-brand {
            color: #166534;
            font-weight: bold;
        }


        /* =========================================================
           DATE
        ========================================================= */

        .date {
            color: #374151;
            font-weight: bold;
        }

    </style>

</head>


<body>


    {{-- =========================================================
         HEADER
    ========================================================== --}}

    <div class="header">

        <table class="header-table">

            <tr>

                <td class="header-left">

                    <div class="logo">

                        <span class="logo-leaf"> </span>

                        SenAgri

                    </div>

                    <div class="logo-subtitle">
                        Plateforme agricole B2B
                    </div>

                </td>


                <td class="header-right">

                    <div class="invoice-title">
                        FACTURE
                    </div>

                    <div class="invoice-number">

                        N° FAC-{{ $commande->id }}

                    </div>

                </td>

            </tr>

        </table>

    </div>



    {{-- =========================================================
         INFORMATIONS
    ========================================================== --}}

    <table class="invoice-meta">

        <tr>

            <td class="meta-box">

                <div class="meta-title">
                    Numéro de facture
                </div>

                <div class="meta-value">
                    FAC-{{ $commande->id }}
                </div>

            </td>


            <td class="meta-box">

                <div class="meta-title">
                    Date de commande
                </div>

                <div class="meta-value date">

                    {{ $commande->date_commande }}

                </div>

            </td>

{{--
            <td class="meta-box">

                <div class="meta-title">
                    Statut
                </div>

                <div class="meta-value">

                    @if($commande->statut === 'livree')

                        <span class="status">
                            Livrée
                        </span>

                    @elseif($commande->statut === 'confirmee')

                        <span class="status">
                            Confirmée
                        </span>

                    @elseif($commande->statut === 'expediee')

                        <span class="status">
                            Expédiée
                        </span>

                    @elseif($commande->statut === 'annulee')

                        <span style="color:#dc2626;">
                            Annulée
                        </span>

                    @else

                        <span style="color:#d97706;">
                            En attente
                        </span>

                    @endif

                </div>

            </td>
--}}
            

        </tr>

    </table>



    {{-- =========================================================
         ACHETEUR / VENDEUR
    ========================================================== --}}

    <table class="parties">

        <tr>

            <td class="party-box">

                <div class="party-label">
                    Acheteur
                </div>

                <div class="party-name">

                    {{ $commande->acheteur->nom }}

                </div>

                <div class="party-email">

                    {{ $commande->acheteur->email }}

                </div>

                @if($commande->acheteur->telephone)

                    <div class="party-email">

                        {{ $commande->acheteur->telephone }}

                    </div>

                @endif

            </td>


            <td class="party-box">

                <div class="party-label">
                    Vendeur
                </div>

                <div class="party-name">

                    {{ $commande->offre->vendeur->nom }}

                </div>

                <div class="party-email">

                    {{ $commande->offre->vendeur->email }}

                </div>

                @if($commande->offre->vendeur->telephone)

                    <div class="party-email">

                        {{ $commande->offre->vendeur->telephone }}

                    </div>

                @endif

            </td>

        </tr>

    </table>



    {{-- =========================================================
         PRODUIT
    ========================================================== --}}

    <table class="products">

        <thead>

            <tr>

                <th>
                    Produit
                </th>

                <th>
                    Quantité
                </th>

                <th class="right">
                    Prix unitaire
                </th>

                <th class="right">
                    Total
                </th>

            </tr>

        </thead>


        <tbody>

            <tr>

                <td>

                    <div class="product-name">

                        {{ $commande->offre->nom }}

                    </div>

                    @if($commande->offre->categorie)

                        <div class="product-description">

                            {{ $commande->offre->categorie->nom }}

                        </div>

                    @endif

                </td>


                <td>

                    {{ $commande->quantite }}

                    @if($commande->offre->unite)

                        {{ $commande->offre->unite }}

                    @endif

                </td>


                <td class="right">

                    {{ number_format(
                        $commande->offre->prix_unitaire,
                        0,
                        ' ',
                        ' '
                    ) }}

                    FCFA

                </td>


                <td class="right">

                    <strong>

                        {{ number_format(
                            $commande->prix_total,
                            0,
                            ' ',
                            ' '
                        ) }}

                        FCFA

                    </strong>

                </td>

            </tr>

        </tbody>

    </table>



    {{-- =========================================================
         TOTAL
    ========================================================== --}}

    <div class="total-container">

        <table class="total-table">

            <tr>

                <td class="total-label">
                    Sous-total
                </td>

                <td class="total-value">

                    {{ number_format(
                        $commande->prix_total,
                        0,
                        ' ',
                        ' '
                    ) }}

                    FCFA

                </td>

            </tr>


            <tr>

                <td class="total-label">
                    Livraison
                </td>

                <td class="total-value">
                    —
                </td>

            </tr>


            <tr>

                <td colspan="2"
                    class="grand-total">

                    TOTAL À PAYER :

                    {{ number_format(
                        $commande->prix_total,
                        0,
                        ' ',
                        ' '
                    ) }}

                    FCFA

                </td>

            </tr>

        </table>

    </div>



    {{-- =========================================================
         MESSAGE
    ========================================================== --}}

    <div class="thank-you">

        <strong class="green-dark">
            Merci pour votre confiance.
        </strong>

        <br>

        SenAgri facilite les échanges entre producteurs,
        vendeurs et acheteurs agricoles au Sénégal.

    </div>



    {{-- =========================================================
         FOOTER
    ========================================================== --}}

    <div class="footer">

        <span class="footer-brand">
            SenAgri
        </span>

        &nbsp; — &nbsp;

        Plateforme agricole B2B

        &nbsp; | &nbsp;

        Facture FAC-{{ $commande->id }}

    </div>


</body>

</html>