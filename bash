# First, make sure your Convex dev server is running
npx convex dev

# In another terminal, run the seed command to add the new courses
npx convex run seedData:addCourses

# Optionally, if you want to grant demo points to the intern for testing
npx convex run seedData:grantDemoPoints
