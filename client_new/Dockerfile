From node:alpine as builder
workdir /usr/app
copy ./package.json ./
run npm install
copy . .
run npm run build

from nginx
expose 3000
copy ./nginx/default.conf /etc/nginx/conf.d/default.conf
copy --from=builder /usr/app/build /usr/share/nginx/html