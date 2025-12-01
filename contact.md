---
layout: page
title: Contact
---

<div class="contact-form-container">
  <div class="contact-intro">
    <h1>Get in Touch</h1>
    <p>Have questions about gymnastics coaching? Want to learn more about my programs? Fill out the form below and I'll get back to you as soon as possible.</p>
  </div>

  <form action="https://formspree.io/f/xrbnkeql" method="POST" class="contact-form">
    <div class="form-group">
      <label for="name">Name <span class="required">*</span></label>
      <input type="text" id="name" name="name" required>
    </div>

    <div class="form-group">
      <label for="email">Email <span class="required">*</span></label>
      <input type="email" id="email" name="email" required>
    </div>

    <div class="form-group">
      <label for="phone">Phone Number</label>
      <input type="tel" id="phone" name="phone">
    </div>

    <div class="form-group">
      <label for="subject">Subject <span class="required">*</span></label>
      <select id="subject" name="subject" required>
        <option value="">Select a subject...</option>
        <option value="General Inquiry">General Inquiry</option>
        <option value="Coaching Services">Coaching Services</option>
        <option value="Private Lessons">Private Lessons</option>
        <option value="Group Classes">Group Classes</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div class="form-group">
      <label for="message">Message <span class="required">*</span></label>
      <textarea id="message" name="message" rows="6" required></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Send Message</button>
  </form>

  <div class="contact-alternative">
    <p>Prefer to email directly? Reach me at <a href="mailto:aidanbevan09@gmail.com">aidanbevan09@gmail.com</a></p>
  </div>
</div>
