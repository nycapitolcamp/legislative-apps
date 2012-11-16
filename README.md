Open Legislation
===============
[Bill Diff ](#Bill)

[Transcript parsing ](#Transcripts)

##References

[Open Legislation Site](http://open.nysenate.gov/legislation/)

[Open Legislation Codebase](https://github.com/nysenate/OpenLegislation/)

[API Documentation](http://openlegislation.readthedocs.org/en/latest/)

Alternative Leg Info - [onsite](http://leginfo.state.ny.us/) and [offsite](http://public.leginfo.state.ny.us)

 <h1 id='Bill'>Bill Diff</div>

##Example Bills

Simple Bill
[S1234-2011](http://open.nysenate.gov/legislation/bill/S1234-2011) [(API XML)](http://open.nysenate.gov/legislation/2.0/bill/S1234-2011.xml)

BIll with version in Assembly & senate
[S70A-2011](http://open.nysenate.gov/legislation/bill/S70A-2011) [(API XML)](http://open.nysenate.gov/legislation/2.0/bill/S70A-2011.xml) = [A3030A-2011](http://open.nysenate.gov/legislation/bill/A3030A-2011) [(API XML)](http://open.nysenate.gov/legislation/2.0/bill/A3030A-2011.xml)

BIll with Amendment 
[S39-2011](http://open.nysenate.gov/legislation/bill/S39-2011) [(API XML)](http://open.nysenate.gov/legislation/2.0/bill/S39-2011.xml) -> [S39A-2011](http://open.nysenate.gov/legislation/bill/S39A-2011) [(API XML)](http://open.nysenate.gov/legislation/2.0/bill/S39A-2011.xml) 


##Front-end Meta of a Bill 

###Same as:
    A sister bill in the Assembly 

###Versions:
    Amendments to the bill as it progresses

###Sponsor / Co-sponsor(s): 
    "Owner" of the bill

###Committee: 
    Organization in charge or vetting the bill

###Law Section: 
    What the bill will modify

###Law: 
    The specific law that will be modified

###Actions: 
    Actions taken to the bill

###Memo:


###Bill Text: 
    Body of the bill


##API updates 

###bill 
oid         `<bill number>-<year>`

otype       `bill`

osearch     `<bill number> <sameas> <sponsor> <summary> <title>`

actclause   `The bill act clause`

actions     `Contains the text for all the bill’s previous actions.`

committee   `The name of the current committee holding the bill.`

cosponsors  `Contains the short names of all bill cosponsors.`

full        `The full text of the bill.`

lawsection  `The lawsection of the bill, i.e. General Business Law.`

memo        `The bill memo.`

pastcommittees  `Contains the names of all the bills past committees.`

sameas      `Specifies the id of the bill’s sister document. Senate bills introduced in the assembly and visa versa.`

**previousVersions**     `A bit broken currently, cuts off the trailing number :-/`

sponsor     `The short name of the bill sponsor.`

stricken    `Boolean value indicating if the bill has been stricken.`

summary     `The bill summary text.`

title       `The bill title.`

year       ` The bill session year (2009, 2011, etc.)`

 <h1 id='Transcripts'>Transcript Parsing</div>

##Example Transcripts

Simple Transcripts
[regular session 02-29-2012](http://open.nysenate.gov/legislation/transcript/regular-session-02-29-2012) [(API XML)](http://open.nysenate.gov/legislation/2.0/transcript/regular-session-02-29-2012.xml) 

Long Transcripts
[regular session 06-20-2012](http://open.nysenate.gov/legislation/transcript/regular-session-06-20-2012) [(API XML)](http://open.nysenate.gov/legislation/2.0/transcript/regular-session-06-20-2012.xml) 


