import "@logseq/libs";

import { format, sub } from 'date-fns'
import { logseq as PL } from "../package.json";
import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";

const pluginId = PL.id;

interface Data {
  html: string
  text: string
  year: string
  no_year_html: string
  links: {
    link: string
    title: string
  }[]
}
interface History {
  url: string;
  date: string
  data: {
    Events: Data[]
    Births: Data[]
    Deaths: Data[]
  }
}

const getPastYearsSameDay = async (formatType: string, length: number = 10) => {
  const uuids = [];
  let day = new Date()
  let i = 0
  let page: PageEntity | null = await logseq.Editor.getPage(format(day, formatType))

  while (!!page?.uuid || i <= length) {
    i++
    const pastYearDate = sub(day, { years: 1 });
    day = pastYearDate;
    const pastYearDateText = format(pastYearDate, formatType)
    page = await logseq.Editor.getPage(pastYearDateText);
    page?.uuid && uuids.unshift(page.uuid);
  }

  return uuids;
}

const init = async () => {
  let isShow = false

  const configs = await logseq.App.getUserConfigs()

  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    isShow = visible
  })

  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `
      <div data-on-click="handleToggleSidebar" title="That year today" class="button">
        <svg t="1723427449592" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10772" id="mx_n_1723427449594" width="18" height="18">
          <path d="M875.008 102.912h-135.68v-38.4c0-20.992-17.408-38.4-38.4-38.4s-38.4 17.408-38.4 38.4v38.4h-296.96v-38.4c0-20.992-17.408-38.4-38.4-38.4s-38.4 17.408-38.4 38.4v38.4H148.992c-66.56 0-120.32 53.76-120.32 120.32v660.48c0 66.56 53.76 120.32 120.32 120.32h726.016c66.56 0 120.32-53.76 120.32-120.32v-660.48c0-66.56-53.76-120.32-120.32-120.32z m43.52 780.8c0 24.064-19.456 43.52-43.52 43.52H148.992c-24.064 0-43.52-19.456-43.52-43.52v-660.48c0-24.064 19.456-43.52 43.52-43.52h139.776v28.16c0 20.992 17.408 38.4 38.4 38.4s38.4-17.408 38.4-38.4v-28.16h296.96v28.16c0 20.992 17.408 38.4 38.4 38.4s38.4-17.408 38.4-38.4v-28.16h135.68c24.064 0 43.52 19.456 43.52 43.52v660.48z" p-id="10773" fill="#859aa2"></path><path d="M671.744 603.648h-343.04c-19.456 0-34.816 15.36-34.816 34.816s15.36 34.816 34.816 34.816h288.256c-21.504 29.696-44.032 58.88-67.072 86.528-13.824 16.896-28.16 33.28-43.008 48.64-14.848 16.384-11.264 41.984 7.168 53.248l2.56 1.536c14.336 8.704 32.768 6.144 44.544-6.656 22.528-25.6 45.056-51.2 66.048-77.824 25.088-31.744 49.664-64.512 72.704-99.84 3.584-5.632 5.632-12.288 5.632-19.456v-22.016c1.024-17.92-14.848-33.792-33.792-33.792zM756.736 506.88c-45.568-25.088-84.48-52.224-117.248-81.92-35.328-31.744-65.536-67.584-91.136-106.496-6.656-10.24-17.92-16.384-30.208-16.384H501.76c-11.776 0-22.528 5.632-29.696 15.36-26.624 38.4-58.368 73.728-94.72 105.984C344.064 454.144 305.152 481.28 261.12 506.88c-17.408 9.728-23.04 32.256-13.312 49.152 10.24 17.408 32.768 23.04 50.176 12.288 15.36-9.216 30.208-18.944 44.544-29.184 24.064-16.896 46.592-34.304 68.096-53.248 43.008-36.864 75.776-71.68 98.816-104.448 11.776 16.896 25.6 34.816 42.496 52.736 16.896 17.92 36.352 36.864 58.368 55.808 35.328 30.208 72.704 56.832 111.616 79.36 17.408 9.728 39.424 4.096 49.152-13.312 9.728-16.896 3.584-39.424-14.336-49.152z" p-id="10774" fill="#859aa2"></path><path d="M479.744 549.888c8.704 11.264 18.432 21.504 27.136 31.232 9.728 10.752 25.6 12.288 37.376 4.096l5.632-4.096c12.288-9.216 14.848-26.624 5.632-38.912-7.168-9.216-15.36-19.456-25.088-31.232-9.216-11.264-17.408-20.992-25.088-29.696l-3.072-3.072c-9.728-10.752-26.112-11.776-37.376-3.072l-5.632 4.608c-12.288 9.728-14.336 27.648-4.096 39.936v0.512c7.168 7.68 15.872 17.92 24.576 29.696z" p-id="10775" fill="#859aa2"></path>
        </svg>
      </div>
    `,
  });

  logseq.provideModel({
    async handleToggleSidebar() {
      const uuids = await getPastYearsSameDay(configs.preferredDateFormat)

      if (!isShow) {
        isShow = true

        const res = await logseq.Editor.createPage(`.${format(new Date(), 'MM-dd')} In History`, {}, { redirect: false })
        if (res?.uuid) {
          uuids.unshift(res.uuid)
        }

        uuids.map(i => logseq.Editor.openInRightSidebar(i))

        const history: History = await fetch('https://history.muffinlabs.com/date').then(res => res.json())

        if (!res?.uuid) return
        await logseq.Editor.appendBlockInPage(res.uuid, `> ${history.url}`)
        const events = await logseq.Editor.appendBlockInPage(res.uuid, `## Events`)
        const deaths = await logseq.Editor.appendBlockInPage(res.uuid, `## Deaths`)
        const births = await logseq.Editor.appendBlockInPage(res.uuid, `## Births`)

        events?.uuid && await logseq.Editor.insertBatchBlock(events.uuid, history.data.Events.reverse().map(i => ({
          content: i.html
        })), { sibling: false })

        deaths?.uuid && await logseq.Editor.insertBatchBlock(deaths.uuid, history.data.Events.reverse().map(i => ({
          content: i.html
        })), { sibling: false })

        births?.uuid && await logseq.Editor.insertBatchBlock(births.uuid, history.data.Events.reverse().map(i => ({
          content: i.html
        })), { sibling: false })

        return logseq.Editor.exitEditingMode()
      }

      if (isShow) {
        isShow = false
        logseq.Editor.deletePage(`.${format(new Date(), 'MM-dd')} In History`)
        return logseq.App.clearRightSidebarBlocks({ close: true })
      }
    },
  });
}

async function main() {
  console.info(`#${pluginId}: MAIN`)

  init();
  logseq.App.onCurrentGraphChanged(init)
}

logseq.ready(main).catch(console.error)
