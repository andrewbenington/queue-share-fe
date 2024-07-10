// import { CalendarMonth, ListAlt, Refresh } from "@mui/icons-material"
// import {
//     Button,
//     Card,
//     Chip,
//     List,
//     ListItemButton,
//     ListItemContent,
//     ListItemDecorator,
//     Modal,
//     ModalDialog,
//     Sheet,
//     Stack,
//     ToggleButtonGroup,
//     Typography,
// } from "@mui/joy"
// import dayjs, { Dayjs } from "dayjs"
// import { groupBy } from "lodash"
// import { useCallback, useEffect, useMemo, useState } from "react"
// import Calendar, { EventMap } from "../components/calendar"
// import JobRunCard from "../components/jobRunCard"
// import { usePersistentString } from "../hooks/usePersistentState"
// import { GetAllJobRuns, GetJobRunsByName } from "../services/jobs"
// import { JobRun } from "../types/job"
// import { displayError } from "../util/errors"
// import LoadingIconButton from "./loadingIconButton"

// type ViewMode = "list" | "calendar"

// type JobRunContainerProps = {
//     job_name?: string
// }

// export default function JobRunContainer(props: JobRunContainerProps) {
//     const { job_name } = props
//     const [error, setError] = useState<string>()
//     const [jobRuns, setjobRuns] = useState<JobRun[]>()
//     const [viewMode, setViewMode] = usePersistentString<ViewMode>(
//         "job_list_view",
//         "list",
//     )
//     const [modalRuns, setModalRuns] = useState<JobRun[]>()

//     const fetchData = useCallback(async () => {
//         if (error) return
//         const response = job_name
//             ? await GetJobRunsByName(job_name)
//             : await GetAllJobRuns()
//         if ("error" in response) {
//             displayError(response.error)
//             setError(response.error)
//             return
//         }
//         setjobRuns(response)
//     }, [error, job_name])

//     useEffect(() => {
//         if (error) return
//         fetchData()
//     }, [job_name, error, fetchData])

//     const calendarEvents: EventMap = useMemo(() => {
//         const countsMap: {
//             [date: string]: JobRun[]
//         } = {}
//         jobRuns?.forEach((jobRun) => {
//             const dateString = jobRun.timestamp.format("YYYY-MM-DD")
//             if (!(dateString in countsMap)) {
//                 countsMap[dateString] = []
//             }
//             countsMap[dateString].push(jobRun)
//         })
//         return Object.fromEntries(
//             Object.entries(countsMap).map(([dateStr, runData]) => {
//                 const successes = runData.filter((run) => run.success)
//                 const failures = runData.filter((run) => !run.success)
//                 const chips = []
//                 if (successes.length) {
//                     chips.push(
//                         <Chip
//                             color="success"
//                             sx={{ marginTop: 1 }}
//                             onClick={() => setModalRuns(successes)}
//                             variant="solid"
//                         >
//                             Success: {successes.length}
//                         </Chip>,
//                     )
//                 }
//                 if (failures.length) {
//                     chips.push(
//                         <Chip
//                             color="danger"
//                             sx={{ marginTop: 1 }}
//                             onClick={() => setModalRuns(failures)}
//                             variant="solid"
//                         >
//                             Failure: {failures.length}
//                         </Chip>,
//                     )
//                 }
//                 return [dateStr, chips]
//             }),
//         ) as EventMap
//     }, [jobRuns])

//     return (
//         <Stack height="100%">
//             <Card>
//                 <Stack direction="row" justifyContent="space-between">
//                     <Typography fontSize={24}>Job Runs</Typography>
//                     <LoadingIconButton
//                         variant="outlined"
//                         onClickAsync={fetchData}
//                     >
//                         <Refresh style={{ fontSize: 24 }} />
//                     </LoadingIconButton>
//                     <div style={{ flex: 1 }} />
//                     <ToggleButtonGroup
//                         value={viewMode}
//                         onChange={(_, newValue) =>
//                             setViewMode(newValue as ViewMode)
//                         }
//                         color="primary"
//                     >
//                         <Button value="list">
//                             <ListAlt />
//                         </Button>
//                         <Button value="calendar">
//                             <CalendarMonth />
//                         </Button>
//                     </ToggleButtonGroup>
//                 </Stack>
//             </Card>
//             {viewMode === "list" ? (
//                 <Card
//                     style={{
//                         overflowY: "hidden",
//                         height: "100%",
//                         padding: 0,
//                     }}
//                 >
//                     <JobRunList jobs={jobRuns} noName={!!job_name} />
//                 </Card>
//             ) : (
//                 <Card>
//                     <Calendar events={calendarEvents} />
//                 </Card>
//             )}
//             <Modal open={!!modalRuns} onClose={() => setModalRuns(undefined)}>
//                 <ModalDialog minWidth={500} sx={{ overflowY: "auto" }}>
//                     <JobRunList
//                         jobs={modalRuns}
//                         noName={!!job_name}
//                         noSidebar
//                     />
//                 </ModalDialog>
//             </Modal>
//         </Stack>
//     )
// }

// type JobRunListProps = {
//     jobs?: JobRun[]
//     noName?: boolean
//     noSidebar?: boolean
// }
// function JobRunList(props: JobRunListProps) {
//     const { jobs, noName, noSidebar } = props
//     const [maxDate, setMaxDate] = useState<Dayjs>()

//     const groupedJobs = useMemo(() => {
//         const groupedObj = groupBy(jobs, (job) =>
//             job.timestamp.format("MMM DD, YYYY"),
//         )
//         return Object.entries(groupedObj).sort(([dateStrA], [dateStrB]) =>
//             dayjs(dateStrB).diff(dayjs(dateStrA)),
//         )
//     }, [jobs])

//     const findMaxDate = useCallback(() => {
//         const firstDate = groupedJobs.find(([dateStr]) => {
//             const rect = document
//                 .getElementById(dateStr)
//                 ?.getBoundingClientRect()
//             return rect && rect.y > 100
//         })
//         if (firstDate) {
//             setMaxDate(dayjs(firstDate[0]))
//         }
//     }, [groupedJobs])

//     useEffect(() => {
//         if (groupedJobs?.length) {
//             setMaxDate(dayjs(groupedJobs[0][0]))
//         }
//     }, [groupedJobs])

//     return (
//         <Stack
//             direction="row"
//             style={{
//                 overflowY: noSidebar ? "auto" : "hidden",
//                 height: "100%",
//                 display: "flex",
//                 width: "100%",
//             }}
//         >
//             {!noSidebar && (
//                 <Sheet
//                     color="neutral"
//                     variant="soft"
//                     style={{
//                         overflowY: "auto",
//                         width: 220,
//                     }}
//                 >
//                     <List>
//                         {groupedJobs.map(([dateStr, jobRuns]) => (
//                             <ListItemButton
//                                 onClick={() =>
//                                     document
//                                         .getElementById(dateStr)
//                                         ?.scrollIntoView({ behavior: "smooth" })
//                                 }
//                                 selected={maxDate?.isSame(dayjs(dateStr))}
//                                 color="primary"
//                             >
//                                 <ListItemContent>{dateStr}</ListItemContent>
//                                 <ListItemDecorator>
//                                     {jobRuns.filter((run) => !run.success)
//                                         .length > 0 && (
//                                         <Chip color="danger" variant="solid">
//                                             {
//                                                 jobRuns.filter(
//                                                     (run) => !run.success,
//                                                 ).length
//                                             }
//                                         </Chip>
//                                     )}
//                                 </ListItemDecorator>
//                                 <ListItemDecorator>
//                                     {jobRuns.filter((run) => run.success)
//                                         .length > 0 && (
//                                         <Chip color="success" variant="solid">
//                                             {
//                                                 jobRuns.filter(
//                                                     (run) => run.success,
//                                                 ).length
//                                             }
//                                         </Chip>
//                                     )}
//                                 </ListItemDecorator>
//                             </ListItemButton>
//                         ))}
//                     </List>
//                 </Sheet>
//             )}
//             <div
//                 style={{
//                     height: "100%",
//                     overflowY: "auto",
//                     flex: 1,
//                     width: 0,
//                     display: "flex",
//                     alignItems: "center",
//                 }}
//                 onScroll={findMaxDate}
//             >
//                 <Stack
//                     style={{
//                         height: "100%",
//                         margin: "auto",
//                         marginTop: 16,
//                     }}
//                 >
//                     {groupedJobs
//                         ?.sort(([dateStrA], [dateStrB]) =>
//                             dayjs(dateStrB).diff(dayjs(dateStrA)),
//                         )
//                         ?.map(([dateStr, jobsOnDate]) => (
//                             <>
//                                 {!noSidebar && (
//                                     <Typography
//                                         id={dateStr}
//                                         fontSize={22}
//                                         key={dateStr}
//                                     >
//                                         {dateStr}
//                                     </Typography>
//                                 )}
//                                 {jobsOnDate
//                                     ?.sort((a, b) =>
//                                         b.timestamp.diff(a.timestamp),
//                                     )
//                                     ?.map((jobRun) => (
//                                         <JobRunCard
//                                             key={
//                                                 jobRun.name +
//                                                 "-" +
//                                                 jobRun.timestamp.toISOString()
//                                             }
//                                             title={
//                                                 jobRun.name +
//                                                 "-" +
//                                                 jobRun.timestamp.toISOString()
//                                             }
//                                             jobRun={jobRun}
//                                             noName={noName}
//                                         />
//                                     ))}
//                             </>
//                         ))}
//                 </Stack>
//             </div>
//         </Stack>
//     )
// }
