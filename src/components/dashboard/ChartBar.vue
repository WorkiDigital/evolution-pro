<template>
  <div class="chart-wrapper">
    <apexchart
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
export default {
  name: 'ChartBar',
  props: {
    series: {
      type: Array,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          toolbar: { show: false },
          background: 'transparent'
        },
        colors: ['#3b82f6'],
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '45%',
            distributed: false,
          }
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: this.categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px'
            }
          }
        },
        grid: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
          strokeDashArray: 4
        },
        tooltip: {
          theme: 'dark'
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 350px;
}
</style>
