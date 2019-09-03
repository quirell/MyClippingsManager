# Kindle Clippings Manager

## Goals of this project
Main goal is to be able to export clippings
in a format friendly for reviewing foreign languages words on Kindle.
For example for each highlighted word there
would be a page containing word, translation,
and context taken from a book.

    word
    translation (Japanese only)
    context
    
Context would be sentence that the word is contained in,
or optionally also adjacent sentences.
This feature would require user to upload
a book and their Kindle's serial number to remove DRM from it. 
- Recreate some of clippings viewing functionality that Kindle devices offer 
using only MyClippings.txt file
- Parse MyClippings.txt in multiple languages
- Group Highlights and Notes whose locations overlap
 and show them as one like amazon clippings viewer does
- Show clippings in book context as kindle device shows them
- Export clippings in kindle friendly format
- If highlight is a single word in or expression,
 display it's translation 