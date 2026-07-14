const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const client = new BetaAnalyticsDataClient({
    // keyFilename: process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY,
    keyFilename: 'service-account.json',
});

async function runReport() {
    const [response] = await client.runReport({
        property: `properties/486687329`,
        dateRanges: [{ startDate: 'yesterday', endDate: 'yesterday' ,name:"YESTERDAY"}],
        dimensions: [
            { name: 'pagePath' }
        ],

        metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'screenPageViewsPerUser' },
            { name: 'userEngagementDuration' },
            { name: 'eventCount' },
            // {name:'averageUserEngagementDuration'}
        ],

        dimensionFilter: {
            filter: {
                fieldName: 'pagePath',
                stringFilter: {
                    matchType: 'EXACT',
                    value: '/gamejam',
                    // caseSensitive:true
                }
            }
        }
    });

    console.log(response.rows[0]);
     // Format output
    const result = response.rows.map(row => ({
      EndPoint: row.dimensionValues[0].value,
      PageViews: row.metricValues[0].value,
      ActiveUsers: row.metricValues[1].value,
      Avg_Session_Time: row.metricValues[3].value / row.metricValues[1].value,
      EventCount: row.metricValues[4].value ,
    }));

    console.log('📊 GA4 Stats:\n');
    console.table(result);
}

runReport();