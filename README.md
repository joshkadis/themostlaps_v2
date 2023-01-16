# The Most Laps v2

## API

Base is `/api/v3`

|Route|Description|
|-----|-----------|
|`/athletes/<athleteId>`|Single athlete by ID|
|`/athletes?ids=<ids>`|Multiple athletes as CSV of IDs|
|`/stats/rankings/location/<location>?<type>`|Ranking like all-time total or single ride|
|`/stats/rankings/location/<location>?<year>[&<month>]`|Ranking for year or year+month time period|

* Pagination for stats routes: `per_page`, `page`
* Order defaults to `desc`, can use `asc`
