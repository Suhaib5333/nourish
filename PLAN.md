# Nourish - ARFID Therapy Companion App

## Overview

A mobile-first React web app for managing ARFID (Avoidant/Restrictive Food Intake Disorder) therapy — used by both the patient and their therapist Fatima. Every feature is built around a **visual metaphor** — Food Map is an actual map, Bridge Foods shows real bridges, the Exposure Ladder is a climbable ladder, the Library is a bookshelf. The app feels like a world you explore, not a spreadsheet you fill in.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 + Vite | Fast dev, modern, matches your existing repos |
| Routing | React Router v7 | Multi-page flows, role-based layouts, deep linking |
| Animations | Framer Motion | Page transitions, micro-interactions, metaphor animations |
| Styling | CSS Modules + CSS custom properties | Clean separation, scoped styles per feature |
| State | React Context + localStorage | Matches your patterns, usePersistedState hook |
| Icons | Lucide React | Clean SVG icons for UI chrome |
| Charts | Recharts | Mood/trigger analytics on therapist side |
| Fonts | DM Sans (body) + DM Serif Display (headings) | Warm, therapeutic feel |
| Illustrations | CSS/SVG art + Framer Motion | Hand-crafted visual metaphors, no stock images |

---

## Color System

```
--sage:         #6B8F71    (primary — growth, safety)
--sage-dark:    #4A7C59    (active states, filled progress)
--sage-light:   #E8F0E9    (soft backgrounds)
--cream:        #F5F0EB    (app background)
--warm:         #FFF3E0    (warnings, triggers)
--bark:         #2D3A2E    (primary text)
--stone:        #8A9B8E    (secondary text)
--sand:         #D4CDC4    (borders, inactive)
--white:        #FFFFFF    (cards, sheets)
--danger:       #D32F2F    (destructive, avoided)
--success:      #4CAF50    (wins, accepted)
--caution:      #FFA726    (maybe, pending)
--sky:          #7BAFD4    (bridge water)
--ladder-wood:  #C4A46C    (ladder rungs)
--library-wood: #8B6F47    (bookshelf)
--win-gold:     #F0C75E    (trophy, celebrations)
```

---

## Folder Structure

```
src/
  app/
    App.jsx                 # Root — role gate, routing
    routes.jsx              # All route definitions
  components/
    ui/                     # Shared primitives
      Card.jsx
      Button.jsx
      BottomSheet.jsx       # Slide-up sheet (replaces modals)
      Input.jsx
      Textarea.jsx
      Select.jsx
      Badge.jsx
      ProgressBar.jsx
      ComfortPicker.jsx     # 1-5 tappable buttons
      EmptyState.jsx
      Toast.jsx
      ConfirmDialog.jsx
      SegmentedControl.jsx  # Toggle between sub-views
    layout/
      AppShell.jsx          # Top bar + nav + page container
      BottomNav.jsx         # Patient 5-tab nav
      TherapistNav.jsx      # Therapist nav
      PageTransition.jsx    # Framer Motion page wrapper
    visuals/                # The creative metaphor components
      MapTerrain.jsx        # SVG terrain/island map for Food Map
      MapPin.jsx            # Animated pin that drops onto the map
      BridgeScene.jsx       # SVG bridge over water
      BridgePlank.jsx       # Individual plank (one per attempt)
      LadderVisual.jsx      # SVG/CSS ladder with rungs
      LadderRung.jsx        # Individual rung (checkable step)
      BookshelfGrid.jsx     # CSS bookshelf with book spines
      BookSpine.jsx         # Individual book (one per food)
      TrophyCase.jsx        # SVG trophy shelf for wins
      TrophyItem.jsx        # Individual trophy
      MoodGarden.jsx        # Growing garden visual for mood tracking
      MoodPlant.jsx         # Individual plant (grows with comfort level)
      TriggerStorm.jsx      # Weather visual for trigger patterns
  features/
    auth/
      RoleSelect.jsx        # Landing — patient / therapist
      TherapistPin.jsx      # PIN gate for therapist
    home/
      HomePage.jsx          # Patient dashboard — the "world map" overview
      QuickActions.jsx      # Floating action buttons
      RecentActivity.jsx    # Activity feed
      InsightCard.jsx       # Auto-generated insight
    food-map/
      FoodMapPage.jsx       # The actual map view
      MapView.jsx           # Interactive terrain map with food zones
      AddFoodSheet.jsx      # Bottom sheet form
      FoodDetail.jsx        # Full detail — slide up from pin tap
      CategoryZone.jsx      # A region on the map per category
    bridge-foods/
      BridgeFoodsPage.jsx   # Bridge scene overview
      BridgeCard.jsx        # One bridge per food — planks fill in with attempts
      AddBridgeSheet.jsx    # Form to add bridge
      BridgeDetail.jsx      # Detail view with attempt history
      LogAttemptSheet.jsx   # Log attempt bottom sheet
    triggers/
      TriggerLogPage.jsx    # Storm/weather scene
      AddTriggerSheet.jsx   # Log trigger form
      TriggerInsights.jsx   # Pattern chart
      StormView.jsx         # Visual intensity based on trigger frequency
    exposure/
      ExposurePage.jsx      # All ladders view
      LadderDetail.jsx      # Single ladder — tap rungs to climb
      AddLadderSheet.jsx    # Create ladder form
    safe-library/
      SafeLibraryPage.jsx   # Bookshelf view
      ShelfRow.jsx          # One shelf per category
      BookDetail.jsx        # Tap a book spine to see food details
    wins/
      WinsPage.jsx          # Trophy case view
      AddWinSheet.jsx       # Log a win
      Confetti.jsx          # Celebration animation
      MilestoneCard.jsx     # At 5, 10, 25, 50 wins
    mood-meals/
      MoodMealsPage.jsx     # Garden view
      AddMoodSheet.jsx      # Log mood form
      GardenView.jsx        # Plants that grow based on comfort
      MoodInsights.jsx      # Trend charts
    therapist/
      TherapistDashboard.jsx
      PatientTimeline.jsx
      TriggerAnalysis.jsx
      MoodAnalysis.jsx
      BridgeFoodManager.jsx
      ExposurePlanner.jsx
      SessionNotes.jsx
      ProgressReport.jsx
  hooks/
    usePersistedState.js
    useRole.js
    useToast.js
    useAnimatedMount.js     # Staggered mount animations
  context/
    AppContext.jsx           # All shared state
    RoleContext.jsx          # Role + PIN
  utils/
    uid.js
    dates.js
    analytics.js            # Pattern detection, averages, trends
  styles/
    global.css              # Resets, custom properties, typography
    animations.css          # Shared keyframes + Framer variants
  assets/
    fonts/
```

---

## The Visual Metaphors (The Creative Core)

### Food Map — An Actual Terrain Map

The Food Map is a **hand-drawn style illustrated map** — think treasure map meets food journey. The screen shows a top-down terrain with distinct **zones** for each category:

- **Protein Peninsula** — a coastline area with meat/fish icons
- **Carb Canyon** — a valley/canyon region
- **Veggie Valley** — green rolling hills
- **Fruit Forest** — tree-covered area
- **Snack Summit** — a small mountain peak
- **Drink Delta** — a river delta region
- **Dairy Dunes** — sandy/creamy terrain
- **Other Outpost** — an island off to the side

**How it works:**
- Each safe food is a **map pin** dropped into its zone
- Pins are colored by category with a subtle drop animation when added
- Tap a pin -> food detail slides up from bottom
- Zones that are empty appear faded/foggy ("unexplored territory")
- As you add foods, the map fills in and zones become vibrant
- A small compass rose in the corner shows total food count
- The map is scrollable/pannable within a fixed viewport
- Adding a new food shows the pin dropping with a satisfying bounce

**Implementation:** SVG-based map with positioned absolute pins. Each zone is an SVG path with a clip region. CSS filter for the fog effect on empty zones. Framer Motion for pin drop animations.

---

### Bridge Foods — Actual Bridges Over Water

Each bridge food is visualized as a **bridge being built plank by plank** over a gentle river:

- The left bank shows the **safe food** (familiar ground, green and solid)
- The right bank shows the **new food** (slightly foggy, becomes clear when accepted)
- The bridge between them starts as just **rope/outline**
- Each **attempt** adds a wooden plank to the bridge
- The comfort level of each attempt determines plank color:
  - 1-2: Shaky/light plank
  - 3: Solid plank
  - 4-5: Strong/dark plank
- A bridge with all strong planks becomes a solid stone bridge (accepted)
- A rejected bridge shows broken planks falling into water
- "Maybe" bridges glow softly, waiting

**The overview page** shows a river scene with all bridges side by side. Scroll horizontally through your bridges. Tap any bridge to see its detail view.

**Fatima's suggestions** appear as a glowing dotted-line bridge outline (not yet started) with a "Fatima suggests..." label floating above it.

**Implementation:** CSS-drawn bridge with flexbox planks. SVG water underneath with a gentle CSS wave animation. Framer Motion for plank addition.

---

### Exposure Ladder — An Actual Climbable Ladder

Each exposure ladder is a **vertical wooden ladder** that you climb rung by rung:

- The ladder leans against a wall
- The **target food** sits at the top on a shelf, slightly glowing
- Each step is a **rung** — labeled with the step description
- Uncompleted rungs are bare wood
- Completed rungs turn green with a checkmark, and a small character figure climbs to that rung
- The progress percentage shows as a height marker on the side
- Completing the final rung triggers the character reaching the food + celebration

**Multiple ladders** are shown as ladders leaning side-by-side against a wall. Each one has its own height/progress. Tap a ladder to enter its detail view.

**Implementation:** CSS grid for the ladder structure. Each rung is a row. The character is a small CSS avatar that transitions position. Framer Motion layoutAnimation for smooth climbing.

---

### Safe Food Library — An Actual Bookshelf

The library is a **wooden bookshelf** with books organized by category shelf:

- Each shelf is a category (Protein shelf, Carbs shelf, etc.)
- Each food is a **book spine** — colored by category, with the food name written vertically
- Thicker books = foods with more detail filled in
- Tap a book -> it "pulls out" with a tilt animation and opens to show food details
- Empty shelves show a "No books yet" placard
- The shelf has a warm wooden texture background
- A library card at the top shows total count: "Your collection: 23 volumes"

**Filter chips** at the top act like library section signs — tap to scroll to that shelf.

**Implementation:** CSS flexbox shelves with perspective transform on book pull. Each book spine is a rotated div. Wooden shelf is a repeating CSS gradient.

---

### Wins Board — A Trophy Case

The wins section is a **glass trophy case** display:

- The hero section shows a big central trophy with the total win count engraved on it
- Below, a trophy shelf displays individual wins as **small trophies/medals/ribbons**
  - First 5 wins: bronze medals
  - 5-10: silver medals
  - 10-25: gold medals
  - 25+: crystal trophies
- Each trophy has the food name engraved below it
- Adding a new win plays a confetti burst + the trophy materializes with a glow
- **Milestone markers** are special: at 5, 10, 25, 50 a larger display case section appears with a special milestone badge
- A timeline view below the case shows wins chronologically

**Implementation:** CSS glass effect (backdrop-filter blur + transparency). Trophy SVGs with different variants. Canvas confetti for celebration.

---

### Mood + Meals — A Growing Garden

Mood tracking is visualized as a **personal garden** that you tend:

- Each logged meal is a **plant** in the garden
- The plant's growth corresponds to comfort level:
  - 1: Seed (just a dot in soil)
  - 2: Sprout (tiny stem)
  - 3: Small plant (a few leaves)
  - 4: Flowering plant (blooming)
  - 5: Full bloom with fruit/flower
- Plants are arranged in a garden bed chronologically (newest on the right)
- The overall garden health (average comfort) affects the background: more green and sunny with higher averages, more grey/overcast with lower
- Mood before eating is the **weather** icon (sun, partly cloudy, cloudy, rainy, stormy)
- Mood after eating is the **soil color** under that plant

**The garden view** scrolls horizontally through your last 14 days of plants. A stats card below shows average comfort and trend.

**Implementation:** CSS-drawn plants with different growth stages. Background gradient shifts based on average. Framer Motion for plant growth animation when new entry added.

---

### Trigger Log — A Weather System

Triggers are visualized as a **weather/storm tracking** system:

- The page header shows the current "weather" based on recent trigger frequency:
  - 0 triggers this week: Clear sunny sky
  - 1-2: Partly cloudy
  - 3-4: Cloudy
  - 5+: Stormy
- Each trigger is a **weather event** in a timeline
- Trigger types have weather icons:
  - Texture issue: Rain
  - Visual issue: Fog
  - Wrong preparation: Lightning
  - Unexpected ingredient: Hail
  - Cross-contamination: Tornado
  - Unknown food: Snow
  - Food combination: Wind
  - Other: Cloud
- The insight card reads like a weather forecast: "Texture storms have been most common this month (4 occurrences). Consider discussing texture strategies with Fatima."

**Implementation:** CSS weather scene with animated elements (rain drops, clouds, lightning flashes). SVG icons per trigger type. The background shifts dynamically.

---

## Application Flow

### Entry Point
```
App loads -> Animated Nourish logo (leaf unfurling)
  -> Check localStorage for saved role
  -> No role? -> RoleSelect (two doors metaphor)
  -> Has role? -> Route to role's home
```

### Patient Navigation (5 tabs)

7 features, 5 tabs — grouped by intent:

| Tab | Icon | Contains | Why grouped |
|-----|------|----------|-------------|
| Home | Compass | Dashboard, quick stats, recent activity, insights | Entry point, overview |
| Foods | Map pin | Food Map (terrain) + Safe Library (bookshelf) toggle | Both about your safe foods |
| Journey | Bridge | Bridge Foods (bridges) + Exposure Ladders (ladders) toggle | Both about trying new things |
| Log | Cloud | Trigger Log (weather) + Mood+Meals (garden) toggle | Both about recording experiences |
| Wins | Trophy | Trophy case, milestone markers, timeline | Dedicated celebration |

**Sub-navigation** within Foods, Journey, and Log uses a segmented control at the top to toggle between the two sub-features. This keeps the bottom nav clean while still giving every feature its own space.

### Therapist Flow
```
RoleSelect ("I'm the therapist")
  -> PIN entry (4-digit)
  -> Therapist Shell (clinical but warm)
     Sections:
       1. Dashboard — at-a-glance patient metrics
       2. Timeline — chronological feed of ALL patient activity
       3. Analysis — charts for triggers, mood, bridges, exposure
       4. Plan — suggest bridges, create ladders, review progress
       5. Notes — session notes (private, date-stamped)
```

**Therapist sees the same data but through a clinical analytical lens** — no visual metaphors on therapist side, clean data-driven cards and charts. The metaphors are for the patient's emotional experience; the therapist needs clarity and pattern recognition.

---

## Therapist Feature Details

### Dashboard
- **Summary cards**: Safe food count (trend arrow), bridge success rate (%), avg comfort (trend), trigger frequency (per week), active ladders count
- **Alert cards**: "No logs in X days", "Comfort trending down", "New trigger pattern: [type] appearing more often", "Bridge food [name] has been 'Maybe' for 2 weeks"
- **Quick actions**: Suggest bridge food, Create ladder, Add session note

### Timeline
- **Unified chronological feed** of all patient activity
- Color-coded dots per type:
  - Green = food added / win logged
  - Blue = mood logged
  - Orange = trigger logged
  - Purple = bridge attempt
  - Teal = ladder step completed
- **Filter chips** at top to show/hide activity types
- **Tap any entry** to see full detail in a sheet

### Analysis
- **Trigger Analysis tab**:
  - Bar chart: triggers by type (all time)
  - Line chart: trigger frequency per week (last 8 weeks)
  - Most avoided foods list
  - Trigger type breakdown per food
- **Mood Analysis tab**:
  - Comfort trend line (daily avg, last 30 days)
  - Before vs. after mood comparison (are meals improving mood?)
  - Lowest comfort meals list
  - Correlation: do triggers spike on low-comfort days?
- **Progress tab**:
  - Bridge success funnel: suggested -> tried -> accepted
  - Exposure completion rate across all ladders
  - Safe food growth chart (cumulative over time)
  - Win frequency per week

### Plan
- **Suggest Bridge Food**: Select from patient's safe foods as starting point, name the target food, add clinical notes for why this bridge makes sense. Appears on patient's bridge list with "Fatima suggests" badge.
- **Create Exposure Ladder**: Pick target food, define custom steps. Appears on patient's ladder list.
- **Review Queue**: Bridge foods in "Maybe" status, incomplete ladders, recent rejections. Fatima can add notes to any of these.

### Session Notes
- Date + session type tag (Initial Assessment, Follow-up, Check-in, Crisis)
- Free-text notes
- Can reference specific patient data ("Re: trigger with butter chicken on 04/08")
- Chronological list, searchable
- Completely private — patient never sees these

---

## Cross-Feature Connections

1. **Food Map <-> Safe Library**: Same data, two visual metaphors (terrain pins vs. book spines)
2. **Food Map -> Bridge Foods**: Safe foods populate the "bridge from" bank
3. **Bridge Foods -> Wins**: Accepting a bridge food -> prompt "Log this as a win?" -> trophy appears
4. **Exposure Ladder -> Wins**: Completing all rungs -> celebration + win prompt
5. **Triggers -> Home Insight**: Most common trigger type shown on home dashboard
6. **Mood -> Home Insight**: Comfort trend shown on home
7. **All Activity -> Therapist Timeline**: Every action feeds the unified timeline
8. **Therapist Plan -> Patient Journey**: Fatima's suggestions appear with special "suggested" styling
9. **Trigger frequency -> Trigger Weather**: Storm intensity is dynamic based on recent data
10. **Comfort average -> Garden Health**: Garden background adapts to overall comfort level

---

## Data Model

All localStorage, namespaced:

```js
// nourish-food-map
[{
  id, name, category, prepMethod, whatILike, wouldntEat, dateAdded
}]

// nourish-bridges
[{
  id, safeFood, bridgeFood, suggestedBy, // "Fatima" | "Self"
  status, // "Not tried" | "In progress" | "Accepted" | "Rejected" | "Maybe"
  attempts: [{ id, reaction, comfortLevel, date }],
  therapistNote, // optional clinical note from Fatima
  dateAdded
}]

// nourish-triggers
[{
  id, food, triggerType, description, avoided, date
}]

// nourish-ladders
[{
  id, targetFood, createdBy, // "Self" | "Fatima"
  steps: [{ id, description, completed, date, order }],
  dateAdded
}]

// nourish-wins
[{
  id, food, notes, date,
  source // "manual" | "bridge" | "ladder"
}]

// nourish-moods
[{
  id, meal, moodBefore, moodAfter, comfort, notes, date
}]

// nourish-session-notes (therapist only)
[{
  id, date, content, sessionType, tags
}]

// nourish-role: "patient" | "therapist" | null
// nourish-therapist-pin: hashed PIN string
```

---

## UI Patterns

- **Bottom sheets** for all forms — slide up from bottom, swipe down to dismiss
- **Page transitions**: Crossfade between main tabs, slide-up for detail views
- **Visual metaphor animations**: Pin drops, plank additions, rung climbs, book pulls, plant growth, trophy materializing
- **Haptic-style**: Scale-down on press, spring-back on release (Framer spring)
- **Toast notifications**: Non-blocking, bottom-positioned, auto-dismiss
- **Skeleton states**: Pulsing placeholder shapes while data loads
- **Empty states**: Each feature has a themed empty state matching its metaphor:
  - Food Map: Foggy blank terrain with "Drop your first pin"
  - Bridge: Calm river with no bridges, "Start building your first bridge"
  - Ladder: Empty wall, "Lean your first ladder"
  - Library: Empty bookshelf, "Your first book awaits"
  - Wins: Empty trophy case, "Your first trophy is coming"
  - Garden: Empty soil bed, "Plant your first seed"
  - Weather: Clear sky, "No storms recorded"

---

## Build Order

### Phase 1: Foundation
1. `npm create vite@latest` — React + JS setup
2. Install deps: react-router, framer-motion, lucide-react, recharts
3. Global CSS: custom properties, resets, DM Sans + DM Serif Display
4. Shared UI components: Button, Card, BottomSheet, Input, Textarea, Select, Badge, ComfortPicker, ProgressBar, SegmentedControl, Toast, EmptyState, ConfirmDialog
5. AppContext + usePersistedState hook
6. RoleContext + RoleSelect screen
7. AppShell + BottomNav + PageTransition + route skeleton

### Phase 2: Visual Components
8. MapTerrain SVG + CategoryZone components
9. BridgeScene + BridgePlank CSS
10. LadderVisual + LadderRung CSS
11. BookshelfGrid + BookSpine CSS
12. TrophyCase + TrophyItem CSS/SVG
13. MoodGarden + MoodPlant CSS
14. TriggerStorm/weather scene CSS

### Phase 3: Patient — Foods
15. Food Map page with terrain map, pins, zones
16. Add food bottom sheet
17. Food detail slide-up view
18. Safe Library bookshelf view
19. Book pull-out detail animation
20. Foods page with segmented toggle (Map / Library)

### Phase 4: Patient — Journey
21. Bridge Foods page — river scene with bridge cards
22. Add bridge sheet, link to safe food dropdown
23. Bridge detail — plank-by-plank view with attempt log
24. Log attempt sheet
25. Exposure Ladder page — wall of ladders
26. Ladder detail — rung climbing view
27. Add ladder sheet
28. Journey page with segmented toggle (Bridges / Ladders)

### Phase 5: Patient — Logging
29. Trigger Log page — weather scene
30. Add trigger sheet
31. Trigger insights card (most common type)
32. Mood + Meals page — garden view
33. Add mood sheet
34. Garden plant growth per comfort level
35. Log page with segmented toggle (Triggers / Mood)

### Phase 6: Patient — Home + Wins
36. Home dashboard — compass overview with quick stats
37. Recent activity feed
38. Insight generation logic
39. Quick action FABs
40. Wins page — trophy case
41. Add win sheet
42. Confetti animation
43. Milestone markers at 5, 10, 25, 50

### Phase 7: Cross-Feature Flows
44. Bridge accepted -> "Log as win?" prompt
45. Ladder completed -> celebration + win prompt
46. Toast system wiring across all actions
47. Empty state per feature with metaphor-themed messaging

### Phase 8: Therapist Side
48. Therapist PIN gate
49. Therapist Dashboard (summary cards, alerts)
50. Patient Timeline (unified chronological feed)
51. Trigger Analysis (bar chart, trend line)
52. Mood Analysis (comfort curve, correlation)
53. Progress Analysis (bridge funnel, food growth)
54. Bridge Food Manager (suggest, review)
55. Exposure Planner (create ladders for patient)
56. Session Notes (CRUD, search)

### Phase 9: Polish
57. All page transition animations
58. Skeleton loading states
59. Button press micro-interactions
60. Visual metaphor animation polish (pin drops, plank builds, rung climbs)
61. PWA manifest + service worker (installable on phone)
62. Responsive final pass (320px - 480px)
63. Therapist tablet layout (sidebar nav on wider screens)

---

## Notes

- **No backend** — localStorage only. Keeps it private, simple, offline-capable. A future version could add Supabase for cloud sync between patient + therapist devices.
- **PWA** — manifest + service worker makes it installable from browser to home screen. Feels like a native app.
- **Therapist PIN** — basic security so patient doesn't accidentally see session notes. Not enterprise auth.
- **Visual metaphors are CSS/SVG** — no heavy image assets, everything renders crisp at any size and animates smoothly.
- **Emoji preserved** for mood selectors and food category identifiers where they add warmth. Lucide icons for navigation and UI actions.
- **Fatima's name** is used contextually in the UI ("Fatima suggests...", "Discuss with Fatima") — it's personal, not generic "your therapist."
