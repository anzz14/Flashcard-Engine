## How I Prompted This Project

I started by thinking through the full idea and the problem I wanted to solve. The concept came from my own experience with flashcards during placement preparation. I had also used Anki before, but I found the UI too difficult to work with and the import/export flow too painful.

After that, I decided the tech stack I wanted to use and planned the workflow around the product goals.

## My Prompting Approach

Instead of asking AI to build everything at once, I first asked it to generate the project structure based on the workflow I had already defined.

Then I broke the app into modules and asked AI to build them one by one. This made it easier to test each part separately. If something broke, I could debug it myself by adding logs and tracing the issue, because I had already written enough of the code to understand how the system worked.

## Building and Debugging

I implemented each module step by step and tested it after every major change. That helped me catch issues early and fix them without losing track of where the problem started.

This approach also made debugging easier because I knew how the pieces were connected and could solve most issues on my own when AI-generated code needed adjustments.

## UI and UX Refinement

Once the core functionality was done, I spent time improving the UX. That took about one day.

After that, I focused on the UI, which took around two days. My goal was to make something that did not look like a typical AI-generated design. A lot of AI designs feel monotonous and similar, so I wanted the product to stand out.

I used AI for the design process too, but I prompted it carefully and then refined a lot of the details myself. The hero section is one example where I used AI as a starting point and then improved it with my own changes.

## Tools I Used

- I used Claude Browser One to help write the prompts, since I did not have premium access.
- I used Copilot to execute the code and bring the ideas into the actual project.

## Summary

My process was simple:

1. Think through the idea and problem first.
2. Decide the tech stack and workflow.
3. Ask AI to generate the project structure.
4. Build the app module by module.
5. Test and debug each part individually.
6. Improve the UX and UI manually where needed.
7. Use AI as support, not as a full replacement for understanding the code.

That approach helped me build faster while still staying in control of the product quality.
