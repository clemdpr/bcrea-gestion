# Gestion boutique B.CREA

Outil privé de B.CREA : stock, matériel, tarifs, demandes et devis, commandes, paiements, clients, devis et factures PDF.
Site séparé du site vitrine. Créé à l'aide de Claude par Clémence Despierre.

Adresse : `https://clemdpr.github.io/bcrea-gestion/`

On s'y connecte avec le compte **b.crea30@gmail.com** du projet Supabase (même email, même mot de passe et même code de double authentification que l'espace privé du site).

## Sécurité
- Ce dépôt ne contient **aucune donnée client** : seulement le code de la page.
- Les données sont dans Supabase, dans la table `gestion` et le dossier privé `gestion`, lisibles **uniquement** par le compte autorisé, connecté (et avec le code si la double authentification est activée).
- La clé de `config.js` est la clé publique (« publishable ») : c'est normal qu'elle soit visible. Ne mettez jamais la clé secrète ici.
- La page n'est pas référencée par les moteurs de recherche.

## Installation (déjà faite le 15/11/2026)
1. Supabase → SQL Editor → coller `installation-gestion.sql` → Run (après `installation.sql` du site).
2. Supabase → Authentication → URL Configuration → **Redirect URLs** : ajouter `https://clemdpr.github.io/bcrea-gestion/**` (pour « Mot de passe oublié »).
3. GitHub : dépôt `bcrea-gestion`, fichiers à la racine, puis Settings → Pages → branche `main`, dossier `/ (root)`.

## Sauvegarde
Bouton **dossier** en haut à droite → **Exporter une sauvegarde**, une fois par mois. Le fichier contient des données personnelles : gardez-le en lieu sûr.
Le même bouton permet de **restaurer** une sauvegarde (par exemple celle exportée depuis l'ancienne version sur Claude).
