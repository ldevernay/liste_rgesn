## Contribuer au projet
Toute contribution est la bienvenue, sous la forme de pull-request. 
En particulier, vous pouvez ajouter ou modifier les entrées vous concernant dans declarations RGESN. 
Si cela ne vous est pas possible, contactez-moi directement pour que je le fasse : 
* https://www.laudevsat.fr
* https://www.linkedin.com/in/laurent-devernay-satyagraha/ 

# Mettre à jour les données

Le fichier `src/declarations.json` est un tableau d'objets :

```json
{
  "url": "...",
  "organisme": "...",
  "version": "V1 2024",
  "justifications": "Oui | Non",
  "audit": "Oui | Non | Information manquante",
  "score": 100.0,
  "derniere_maj": "21/10/2021"
}
```

`derniere_maj` est au format `JJ/MM/AAAA` (valeur par défaut : `21/10/2021`
si inconnue). C'est ce champ qui alimente le tri "Dernière mise à jour"
sur le site.
  
En cas de besoin, se reporter au readme.md pour le fonctionnement du projet.