module.exports = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: "terra01.s3.amazonaws.com",
              port: '',
              pathname: '/images/**',
              search: '',
            },
            {
                protocol: 'https',
                hostname: "res.cloudinary.com",
                port: '',
                pathname: '/dnltxw2jt/**',
                search: '',
              },
            
          ],
      },
};
 