import awsmobile from './aws-exports';

const amplifyConfig = {
    ...awsmobile,
    aws_cloud_logic_custom: [ // ✅ Correct key
        {
            name: 'docupicksApi',
            endpoint: 'https://3oz8vqqgwh.execute-api.us-east-1.amazonaws.com/v1',
            region: 'us-east-1',
            custom_header: async () => ({})
        }
    ]
};

export default amplifyConfig;