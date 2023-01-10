#!/bin/bash

npm run build

if [ $1 == 'testing' ]
  then
    aws --profile irll s3 sync build/ s3://testing.irll.net/ --acl public-read --delete && \
    aws --profile irll cloudfront create-invalidation --distribution-id E1HNZOQOKKYHRM --paths "/*"
fi

