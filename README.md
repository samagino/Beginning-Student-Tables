# Beginning Student Tables
(formerly known as the Table Method Thing)

It's like the Recursive Argument Method except not at all

## How to use
### easy way
click me: http://cedar.sice.indiana.edu:35888/Beginning-Student-Tables/

note: the version of the Table Method Thing at this link may be several commits behind
### slightly less easy way that lets you play around with the code more
1. clone the repo

2. install npm (the NodePackageManager)

   on Debian it's probably
   ```
   sudo apt install npm
   ```
   on Fedora it's probably
   ```
   sudo dnf install npm
   ```
   so however you install packages on your OS/distribution, just do that

3. go to the project directory (two)
   ```
   cd path/to/repo/prototypes/two
   ```

4. using npm, install react-scripts
   ```
   npm install react-scripts
   ```

5. run ```npm start``` to start a development server

6. have fun!

If this doesn't make sense, the README in ```prototypes/two``` contains more info.

## How to Publish (i.e. pushing to gh-pages)
1. go to project directory (two)
   ```
   cd path/to/repo/prototypes/two
   ```

2. using npm, run ```build```
   ```
   npm run build
   ```

3. run server in server directory using racket
   ```
   cd ../../server
   mkdir -p logs
   racket server.rkt
   ``` 
