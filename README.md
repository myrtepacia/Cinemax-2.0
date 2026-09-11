# Cinemax — HTML and CSS

A standalone copy of every page on the Cinemax website. One HTML file per
page, all sharing a single stylesheet, plus a little JavaScript.

No database. Open any `.html` file straight in a browser — double-click it —
and it works. The links between pages work too.

**One exception: the door scanner's camera.** Browsers only hand over a
camera on `https` or `localhost`, never on a `file://` address, so
double-clicking `admin-scanner.html` will get you "the camera could not be
opened". Run the bundled server instead and use the localhost address:

```
node serve.js
```

Then open <http://localhost:4000/admin-scanner.html>. It needs no
`npm install` — it uses only Node's own modules.

## The files

| File                  | Page                                               |
| --------------------- | -------------------------------------------------- |
| `cinemax.css`         | The stylesheet, in 17 numbered sections             |
| `index.html`          | Home — Now Showing and Upcoming Shows               |
| `signin.html`         | Sign in                                             |
| `signup.html`         | Sign up                                             |
| `book.html`           | Booking — seat map, snacks, running total           |
| `ticket.html`         | E-ticket with the QR code                           |
| `account.html`        | My Bookings                                         |
| `terms.html`          | Terms of Service                                    |
| `confirming.html`     | "Confirming your payment" (with the spinner)        |
| `cancelled.html`      | "Payment cancelled"                                 |
| `404.html`            | Page not found                                      |
| `500.html`            | Server error                                        |
| `admin.html`          | Staff dashboard — earnings and the snack queue      |
| `admin-movies.html`   | Staff — movies table and the add-movie form         |
| `admin-scanner.html`  | Staff — door scanner                                |
| `photo/`              | The six film posters                                |
| `qr-sample.svg`       | The e-ticket's QR code — a real one, encoding `CMX-8F41K2` |
| `serve.js`            | Tiny Node server, only needed for the scanner's camera |

### The JavaScript

| File             | Loaded by      | What it does                                                        |
| ---------------- | -------------- | ------------------------------------------------------------------- |
| `js/common.js`   | every page     | The hamburger drawer on a phone, and the Show / Hide password button |
| `js/index.js`    | `index.html`   | Highlights the nav link for the section you have scrolled to         |
| `js/book.js`     | `book.html`    | The running total, and revealing the seats once a showtime is picked |
| `js/admin.js`    | `admin.html`   | Moves a snack order between Preparing → Ready → Sold                 |
| `js/admin-scanner.js` | `admin-scanner.html` | Opens the camera and reads the QR code on a ticket    |
| `js/jsQR.js`     | `admin-scanner.html` | The QR reader itself — a third-party library, not my code    |

Each one stops quietly on a page that has nothing for it to do, which is why
`common.js` can be loaded everywhere.

## The colours

| Hex | Used for |
| --- | --- |
| `#fb2c36` | brand red — buttons, links, the active nav pill |
| `#e7000b` | the red button on hover |
| `#fef2f2` | tint behind anything selected |
| `#101828` `#4a5565` `#6a7282` `#99a1af` | text, darkest to lightest |
| `#ffffff` `#f9fafb` `#f3f4f6` `#e5e7eb` | card, page, hairline, border |
| `#00bc7d` `#dcfce7` `#036e46` `#008236` | green — showing, ready, paid |
| `#4f39f6` `#e0e7ff` | indigo — upcoming, free seats |
| `#a65f00` `#fef9c2` `#854d0e` | amber — warning, preparing |
| `#c10007` `#ffe2e2` | red — error, rejected |
| `#312e81` → `#6d28d9` → `#9333ea` | the e-ticket header gradient, `#ddd6ff` text on it |

## The one trick worth knowing

Selecting a seat on `book.html` uses **no JavaScript at all**. Each seat is a
hidden `<input type="checkbox">` inside a `<label>`, with a visible `<span>`
beside it:

```html
<label class="seat">
  <input type="checkbox" value="C5">
  <span class="seat-box">5</span>
</label>
```

The stylesheet hides the checkbox and restyles the span next to it:

```css
.booking input                  { display: none; }
.seat input:checked + .seat-box { background-color: #fb2c36; }
```

`+` means "the element immediately after". Clicking anywhere in the label
ticks the hidden box, and the span turns red — no script involved.
`js/book.js` only does what CSS cannot: the running total, marking which
seats are already taken, and hiding the map until a showtime is chosen.

## Two things that actually run

**The booking page cascades.** It opens with nothing chosen and the seats
hidden behind "Choose a date and a showtime". Pick a date and the showtime
dropdown fills with just that date's times; pick a showtime and the seats and
snacks appear. Each showtime carries its own sold seats in the markup:

```html
<option value="102" data-date="2026-09-12" data-taken="C1,C2,C3,D6,D7,E1,E2,F9">4:00 PM</option>
```

So switching showtime really does change which seats are grey, and the
"6 seats left" and "full" labels in the dropdown are counted from that same
list rather than typed in by hand. A taken seat's checkbox is `disabled`, so
clicking it does nothing.

**The scanner really scans.** `qr-sample.svg` on the e-ticket page is a real
QR code encoding `CMX-8F41K2`. Open the e-ticket on one screen, the scanner
on another, hold one up to the other, and it reads the reference and shows
the green "Valid ticket". Three references are known to it:

| Code | Result |
| --- | --- |
| `CMX-8F41K2` | green — valid, and Confirm booking marks it used |
| `CMX-3D07Q9` | amber — already scanned |
| anything else | red — not a valid ticket |

## Gotchas

Five things in here are load-bearing and will break quietly if changed. They
used to be comments in the code; they live here now instead.

1. **`.hidden` must stay last in `cinemax.css`.** It has to beat any component
   rule that sets its own `display`, and one plain class selector only beats
   another by coming later in the file. When it sat higher up, `.scan-actions`
   and `.ticket-actions` — both `display: flex` — quietly overrode it and
   their buttons showed when they were meant to be put away.

2. **`.mobile-drawer:not([hidden])`** — the `:not()` is not decoration. A
   plain `.mobile-drawer { display: flex }` is an author style, and an author
   style beats the browser's own `[hidden] { display: none }`, so the drawer
   stayed on screen with `hidden` set on it. Matching only while it is not
   hidden leaves the browser's rule free to do the hiding.

3. **`height: auto` on `.booking-poster`** — the only rule here that is not in
   the live stylesheet. The `<img>` carries `width="900" height="1200"` so the
   browser can reserve space, and those attributes apply as CSS. That gives
   the image an explicit height, and `aspect-ratio` only ever sizes a
   dimension that is `auto` — so without this the poster renders 1200px tall
   with `object-fit` slicing a strip out of the middle. **This is still a live
   bug on the real site.**

4. **`.snacks` and `.snacks h3` match nothing.** The markup has no `.snacks`
   wrapper, so `.seat-area h3` styles that heading instead. Add the wrapper to
   switch them on, or delete the rules. Same in the live stylesheet.

5. **`js/common.js` MOVES the nav into the drawer, it does not copy it.** A
   copy would mean two Sign Out buttons with one dead handler between them,
   and a copy that went stale whenever the bar changed.

## Show / hide password

Not on the live site — this copy adds it. The real work is one line:

```js
input.type = input.type === "password" ? "text" : "password";
```

The button is written into the HTML carrying `hidden`, and `common.js`
removes that on load, so with JavaScript off there is no dead button and the
field just stays masked. It is `type="button"`, or pressing Show would submit
the form. It turns red while the password is on screen.

To put it on the live site you need three pieces: the `.password-field`
wrapper and button in `public/signin.html` and `public/signup.html`, the
`.password-field` / `.password-toggle` rules from section 8 of `cinemax.css`,
and `setupPasswordToggles()` called from `public/js/common.js`.

## How this differs from the live site

The live site builds a lot of its markup at runtime from the database. Those
parts are written out here as ordinary HTML, filled with the sample data the
project seeds: the movie cards, the booking page's dropdowns and seat map and
snack list, the e-ticket details, the My Bookings rows, the staff dashboard
figures and order rows, the movies table, and the scanner's verdict.

Hidden states are included in the markup carrying `class="hidden"` — loading
notes, error messages, empty states. Delete that class on any of them to see
what that state looks like.
