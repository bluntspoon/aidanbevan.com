# Aidan Bevan - Personal Website

A Jekyll-based personal website hosted on GitHub Pages.

## Prerequisites

- [Ruby](https://www.ruby-lang.org/en/downloads/) (version 3.0 or higher recommended)
- [Bundler](https://bundler.io/) (`gem install bundler`)

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bluntspoon/aidanbevan.com.git
   cd aidanbevan.com
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Run the local server:**
   ```bash
   bundle exec jekyll serve
   ```

4. **View your site:**
   Open [http://localhost:4000](http://localhost:4000) in your browser.

## Deployment

This site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

### Custom Domain

The site is configured to use the custom domain `aidanbevan.com`. The `CNAME` file in the repository root contains this domain configuration.

### GitHub Pages Setup

1. Go to your repository's **Settings** > **Pages**
2. Under **Source**, select **GitHub Actions**
3. The site will be automatically built and deployed on each push to `main`

## Project Structure

```
├── _config.yml          # Jekyll configuration
├── _posts/              # Blog posts (if any)
├── index.md             # Homepage content
├── CNAME                # Custom domain configuration
├── Gemfile              # Ruby dependencies
└── .github/workflows/   # GitHub Actions workflow
```

## Adding Content

### Blog Posts

Create new blog posts in the `_posts` directory with the filename format:
```
YYYY-MM-DD-title-of-post.md
```

Example:
```markdown
---
layout: post
title: "My First Post"
date: 2024-01-01
---

Your content here...
```

## License

All rights reserved © Aidan Bevan
