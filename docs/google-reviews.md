# Google reviews on GitHub Pages

The website calls Google Maps JavaScript / Places API (New) directly. No PHP,
WordPress, widget, daily scrape, or separate hosting is used.

Activation:
1. Create a dedicated browser API key in Google Cloud.
2. Enable Maps JavaScript API and Places API (New).
3. Set application restrictions to Websites, allowing:
   - https://estudioideamos.github.io/*
   - https://psicoterapiapyp.com/*
   - https://www.psicoterapiapyp.com/*
4. Restrict API usage to Maps JavaScript API and Places API (New).
5. Set the browser key in assets/js/reviews-config.js and publish.

Browser keys are visible by design and must have the restrictions above.
The previous WordPress key is IP restricted; it is not included in the repository.
Place ID: ChIJC1DeTevLvJURP7AiY8YlzF8

The API returns up to five reviews sorted by relevance. The page requests only
rating, userRatingCount and reviews, once when approaching the section.
It retains the existing editorial selection if not configured or if Google
fails. It does not persist API responses. Verify Google billing/quota and retain
public privacy/terms documents when activating the API.

Docs: https://developers.google.com/maps/documentation/javascript/place-reviews
