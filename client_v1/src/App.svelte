<script>
  import { Router, Route, Link } from 'svelte-routing';
  import Home from './routes/Home.svelte';
  import Game from './routes/Game.svelte';
  import About from './routes/About.svelte'; // Assuming you want an About page
</script>

<main>
  <Router>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link> <!-- Optional based on your initial plan -->
    </nav>
    <div>
      <Route path="/" component={Home} />
      <Route path="/game/:gameId" component={Game} />
      <Route path="/about" component={About} /> <!-- Optional based on your initial plan -->
    </div>
  </Router>
</main>

<style>
  nav a {
    margin-right: 10px;
  }
</style>
